import { describe, expect, it } from "vitest";
import { applyRemote, DELETED, fromServer, keyOf, pendingRows, type Confirmed } from "./syncMerge";

const WS = "ws1";
const confirmedOf = (entries: [string, string, any][]): Confirmed =>
  new Map(entries.map(([c, id, v]) => [keyOf(c, id), v === DELETED ? DELETED : JSON.stringify(v)]));

describe("pendingRows", () => {
  it("uploads only records that differ from what the server confirmed", () => {
    const a = { id: "a", name: "Aqua" }, b = { id: "b", name: "Bottle Co" };
    const confirmed = confirmedOf([["suppliers", "a", a], ["suppliers", "b", { id: "b", name: "Old" }]]);
    const rows = pendingRows(WS, ["suppliers"], { suppliers: [a, b] }, confirmed);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ workspace_id: WS, collection: "suppliers", id: "b", data: b, deleted: false });
  });

  it("uploads new records and skips ones without an id", () => {
    const rows = pendingRows(WS, ["tasks"], { tasks: [{ id: "t1" }, { title: "no id" }, null] }, new Map());
    expect(rows.map((r) => r.id)).toEqual(["t1"]);
  });

  it("soft-deletes confirmed records that are gone locally", () => {
    const confirmed = confirmedOf([["buyers", "x", { id: "x" }]]);
    const rows = pendingRows(WS, ["buyers"], { buyers: [] }, confirmed);
    expect(rows).toEqual([{ workspace_id: WS, collection: "buyers", id: "x", data: {}, deleted: true, _j: DELETED, _k: keyOf("buyers", "x") }]);
  });

  it("does not re-delete what the server already holds as deleted", () => {
    const confirmed = confirmedOf([["buyers", "x", DELETED]]);
    expect(pendingRows(WS, ["buyers"], { buyers: [] }, confirmed)).toEqual([]);
  });

  it("never deletes records in collections this app version does not manage", () => {
    // A newer app stored settings in "cfg"; an older app without "cfg" must leave them alone.
    const confirmed = confirmedOf([["cfg", "prefs", { id: "prefs", theme: "dark" }]]);
    expect(pendingRows(WS, ["suppliers"], { suppliers: [] }, confirmed)).toEqual([]);
  });

  it("does not mutate the confirmed map", () => {
    const confirmed = confirmedOf([["tasks", "old", { id: "old" }]]);
    pendingRows(WS, ["tasks"], { tasks: [{ id: "new" }] }, confirmed);
    expect([...confirmed.keys()]).toEqual([keyOf("tasks", "old")]);
  });
});

describe("fromServer", () => {
  it("returns null data for an empty workspace so the caller seeds it", () => {
    const out = fromServer([{ collection: "tasks", id: "t", data: {}, deleted: true }], ["tasks"]);
    expect(out.data).toBeNull();
    expect(out.confirmed.get(keyOf("tasks", "t"))).toBe(DELETED);
  });

  it("groups live records by collection, sorted by _o with unordered ones last", () => {
    const out = fromServer([
      { collection: "suppliers", id: "c", data: { id: "c" }, deleted: false },
      { collection: "suppliers", id: "b", data: { id: "b", _o: 2 }, deleted: false },
      { collection: "suppliers", id: "a", data: { id: "a", _o: 1 }, deleted: false },
      { collection: "suppliers", id: "d", data: { id: "d" }, deleted: true },
    ], ["suppliers", "buyers"]);
    expect(out.data).toEqual({ suppliers: [{ id: "a", _o: 1 }, { id: "b", _o: 2 }, { id: "c" }], buyers: [] });
  });

  it("confirms only collections this app manages and drops unknown ones from state", () => {
    const out = fromServer([
      { collection: "tasks", id: "t", data: { id: "t" }, deleted: false },
      { collection: "cfg", id: "prefs", data: { id: "prefs" }, deleted: false },
    ], ["tasks"]);
    expect(out.data).toEqual({ tasks: [{ id: "t" }] });
    expect([...out.confirmed.keys()]).toEqual([keyOf("tasks", "t")]);
  });

  it("round-trips: a fresh load has nothing pending", () => {
    const out = fromServer([
      { collection: "tasks", id: "t", data: { id: "t", done: true }, deleted: false },
      { collection: "tasks", id: "gone", data: {}, deleted: true },
    ], ["tasks"]);
    expect(pendingRows(WS, ["tasks"], out.data!, out.confirmed)).toEqual([]);
  });
});

describe("applyRemote", () => {
  it("ignores our own echo", () => {
    const rec = { id: "a", name: "Aqua" };
    const confirmed = confirmedOf([["suppliers", "a", rec]]);
    expect(applyRemote({ suppliers: [rec] }, { collection: "suppliers", id: "a", data: rec, deleted: false }, confirmed)).toBeNull();
  });

  it("ignores malformed rows", () => {
    expect(applyRemote({}, null, new Map())).toBeNull();
    expect(applyRemote({}, { collection: "", id: "a", data: {}, deleted: false }, new Map())).toBeNull();
  });

  it("replaces a partner's edit in place, last write wins", () => {
    const cur = { suppliers: [{ id: "a", name: "Mine" }, { id: "b" }] };
    const confirmed: Confirmed = new Map();
    const next = applyRemote(cur, { collection: "suppliers", id: "a", data: { id: "a", name: "Theirs" }, deleted: false }, confirmed)!;
    expect(next.suppliers).toEqual([{ id: "a", name: "Theirs" }, { id: "b" }]);
    expect(cur.suppliers[0].name).toBe("Mine");
    expect(confirmed.get(keyOf("suppliers", "a"))).toBe(JSON.stringify({ id: "a", name: "Theirs" }));
  });

  it("appends new records, including into a collection not loaded yet", () => {
    const next = applyRemote({}, { collection: "sales", id: "s1", data: { id: "s1" }, deleted: false }, new Map())!;
    expect(next.sales).toEqual([{ id: "s1" }]);
  });

  it("removes soft-deleted records and confirms the delete", () => {
    const confirmed: Confirmed = new Map();
    const next = applyRemote({ tasks: [{ id: "t" }, { id: "u" }] }, { collection: "tasks", id: "t", data: {}, deleted: true }, confirmed)!;
    expect(next.tasks).toEqual([{ id: "u" }]);
    expect(confirmed.get(keyOf("tasks", "t"))).toBe(DELETED);
  });

  it("leaves nothing pending after applying a remote edit", () => {
    const confirmed: Confirmed = new Map();
    const next = applyRemote({ tasks: [] }, { collection: "tasks", id: "t", data: { id: "t" }, deleted: false }, confirmed)!;
    expect(pendingRows(WS, ["tasks"], next, confirmed)).toEqual([]);
  });
});
