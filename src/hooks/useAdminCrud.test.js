import { renderHook, act, waitFor } from "@testing-library/react";
import { useAdminCrud, useAdminPagedList } from "./useAdminCrud";

const okList = (items = []) => ({ success: true, message: "", data: items, errors: [] });

describe("useAdminCrud", () => {
  test("success:false list envelope → error carries the SERVER message, items empty", async () => {
    const list = jest.fn().mockResolvedValue({ success: false, message: "Boom", data: null, errors: [] });

    const { result } = renderHook(() => useAdminCrud({ list }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Boom");
    expect(result.current.items).toEqual([]);
  });

  test("successful list → items from envelope.data", async () => {
    const rows = [{ id: 1, name: "A" }, { id: 2, name: "B" }];
    const list = jest.fn().mockResolvedValue(okList(rows));

    const { result } = renderHook(() => useAdminCrud({ list }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.items).toEqual(rows);
  });

  test("saveItem HTTP rejection → throws with server message + fieldErrors; hook exposes fieldErrors", async () => {
    const list = jest.fn().mockResolvedValue(okList([]));
    const create = jest.fn().mockRejectedValue({
      response: {
        status: 400,
        data: {
          success: false,
          message: "Validation failed",
          errors: [{ field: "name", message: "Name is required" }],
        },
      },
    });

    const { result } = renderHook(() => useAdminCrud({ list, create }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let caught;
    await act(async () => {
      try {
        await result.current.saveItem({ name: "" });
      } catch (err) {
        caught = err;
      }
    });

    expect(caught).toBeInstanceOf(Error);
    expect(caught.message).toBe("Validation failed");
    expect(caught.status).toBe(400);
    expect(caught.fieldErrors).toEqual([{ field: "name", message: "Name is required" }]);
    expect(result.current.fieldErrors).toEqual([{ field: "name", message: "Name is required" }]);
    // Failed save must NOT refetch.
    expect(list).toHaveBeenCalledTimes(1);
  });

  test("saveItem success:false envelope (200 with failure body) → same error shape", async () => {
    const list = jest.fn().mockResolvedValue(okList([]));
    const create = jest.fn().mockResolvedValue({
      success: false,
      message: "Duplicate name",
      data: null,
      errors: [{ field: "name", message: "Already exists" }],
    });

    const { result } = renderHook(() => useAdminCrud({ list, create }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let caught;
    await act(async () => {
      try {
        await result.current.saveItem({ name: "dup" });
      } catch (err) {
        caught = err;
      }
    });

    expect(caught.message).toBe("Duplicate name");
    expect(caught.fieldErrors).toEqual([{ field: "name", message: "Already exists" }]);
    expect(result.current.fieldErrors).toEqual([{ field: "name", message: "Already exists" }]);
  });

  test("saveItem with editingId routes to update({id,...values}) and refetches", async () => {
    const list = jest.fn().mockResolvedValue(okList([]));
    const create = jest.fn();
    const update = jest.fn().mockResolvedValue(okList({ id: 7 }));

    const { result } = renderHook(() => useAdminCrud({ list, create, update }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.saveItem({ name: "Renamed" }, 7);
    });

    expect(update).toHaveBeenCalledWith({ id: 7, name: "Renamed" });
    expect(create).not.toHaveBeenCalled();
    expect(list).toHaveBeenCalledTimes(2); // initial + post-save refetch
  });

  test("removeItem success refetches; failure throws the server message", async () => {
    const list = jest.fn().mockResolvedValue(okList([]));
    const remove = jest
      .fn()
      .mockResolvedValueOnce(okList({}))
      .mockResolvedValueOnce({ success: false, message: "Cannot delete", data: null, errors: [] });

    const { result } = renderHook(() => useAdminCrud({ list, remove }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeItem(3);
    });
    expect(remove).toHaveBeenCalledWith({ id: 3 });
    expect(list).toHaveBeenCalledTimes(2);

    let caught;
    await act(async () => {
      try {
        await result.current.removeItem(4);
      } catch (err) {
        caught = err;
      }
    });
    expect(caught.message).toBe("Cannot delete");
    expect(list).toHaveBeenCalledTimes(2); // no refetch after failure
  });
});

describe("useAdminPagedList", () => {
  const springPage = (page) => ({
    success: true,
    message: "",
    data: {
      content: [`row-${page}-a`, `row-${page}-b`],
      totalElements: 50,
      totalPages: 3,
      number: page,
      size: 20,
    },
    errors: [],
  });

  test("loads page 0 on mount, setPage refetches with the new page param", async () => {
    const fetchFn = jest.fn(({ page }) => Promise.resolve(springPage(page)));

    const { result } = renderHook(() => useAdminPagedList(fetchFn));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchFn).toHaveBeenCalledWith({ page: 0, size: 20 });
    expect(result.current.items).toEqual(["row-0-a", "row-0-b"]);
    expect(result.current.page).toBe(0);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.totalElements).toBe(50);

    act(() => {
      result.current.setPage(1);
    });

    await waitFor(() => expect(result.current.items).toEqual(["row-1-a", "row-1-b"]));
    expect(fetchFn).toHaveBeenLastCalledWith({ page: 1, size: 20 });
    expect(result.current.page).toBe(1);
  });

  test("honours a custom page size", async () => {
    const fetchFn = jest.fn(({ page }) => Promise.resolve(springPage(page)));

    const { result } = renderHook(() => useAdminPagedList(fetchFn, { size: 50 }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchFn).toHaveBeenCalledWith({ page: 0, size: 50 });
  });

  test("success:false envelope → error message, items cleared", async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue({ success: false, message: "Forbidden", data: null, errors: [] });

    const { result } = renderHook(() => useAdminPagedList(fetchFn));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Forbidden");
    expect(result.current.items).toEqual([]);
  });

  test("refresh() reloads the current page", async () => {
    const fetchFn = jest.fn(({ page }) => Promise.resolve(springPage(page)));

    const { result } = renderHook(() => useAdminPagedList(fetchFn));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn).toHaveBeenLastCalledWith({ page: 0, size: 20 });
  });
});
