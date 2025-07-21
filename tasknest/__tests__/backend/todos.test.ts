import { createTodo, getTodos, updateTodo, deleteTodo } from "../../app/api/todos/logic";

const mockCollection = {
  insertOne: jest.fn(),
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
};

jest.mock("../../app/server/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve({
    db: () => ({
      collection: () => mockCollection,
    }),
  }),
}));

describe("Todos API Logic", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    Object.values(mockCollection).forEach(fn => {
      if (typeof fn === 'function' && 'mockClear' in fn) fn.mockClear();
    });
  });

  describe("createTodo", () => {
    it("returns 401 if not authorized", async () => {
      const result = await createTodo({ userId: "", title: "Test", completed: false });
      expect(result.status).toBe(401);
    });
    it("returns 400 if title is missing", async () => {
      const result = await createTodo({ userId: "u1", title: "", completed: false });
      expect(result.status).toBe(400);
    });
    it("returns 400 if completed is not boolean", async () => {
      const result = await createTodo({ userId: "u1", title: "Test", completed: "bad" as any });
      expect(result.status).toBe(400);
    });
    it("returns 201 and todo on success", async () => {
      mockCollection.insertOne.mockResolvedValue({ insertedId: "id1" });
      const result = await createTodo({ userId: "u1", title: "Test", completed: true });
      expect(result.status).toBe(201);
      const body = result.body as { _id: any, title: string, completed: boolean };
      expect(body._id.toString()).toBe("id1");
      expect(body.title).toBe("Test");
      expect(body.completed).toBe(true);
    });
  });

  describe("getTodos", () => {
    it("returns 401 if not authorized", async () => {
      const result = await getTodos({ userId: "" });
      expect(result.status).toBe(401);
    });
    it("returns 200 and todos on success", async () => {
      const mockToArray = jest.fn().mockResolvedValue([{ _id: "id1", title: "T1" }]);
      const mockSort = jest.fn().mockReturnValue({ toArray: mockToArray });
      mockCollection.find.mockReturnValue({ sort: mockSort });
      const result = await getTodos({ userId: "u1" });
      expect(result.status).toBe(200);
      const body = result.body;
      if (Array.isArray(body)) {
        expect(body[0]._id).toBe("id1");
      } else {
        throw new Error("Expected body to be an array");
      }
    });
  });

  describe("updateTodo", () => {
    it("returns 401 if not authorized", async () => {
      const result = await updateTodo({ userId: "", id: "id1", body: {} });
      expect(result.status).toBe(401);
    });
    it("returns 400 if id is invalid", async () => {
      const result = await updateTodo({ userId: "u1", id: "badid", body: {} });
      expect(result.status).toBe(400);
    });
    it("returns 400 if no valid fields", async () => {
      const result = await updateTodo({ userId: "u1", id: "507f1f77bcf86cd799439011", body: {} });
      expect(result.status).toBe(400);
    });
    it("returns 200 and updated todo on success", async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue({ value: { _id: "id1", title: "Updated" } });
      const result = await updateTodo({ userId: "u1", id: "507f1f77bcf86cd799439011", body: { title: "Updated" } });
      expect(result.status).toBe(200);
      const body = result.body as { _id: string, title: string };
      expect(body.title).toBe("Updated");
    });
    it("returns 404 if not found", async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue({ value: null });
      mockCollection.findOne.mockResolvedValue(null);
      const result = await updateTodo({ userId: "u1", id: "507f1f77bcf86cd799439011", body: { title: "Updated" } });
      expect(result.status).toBe(404);
    });
  });

  describe("deleteTodo", () => {
    it("returns 401 if not authorized", async () => {
      const result = await deleteTodo({ userId: "", id: "id1" });
      expect(result.status).toBe(401);
    });
    it("returns 400 if id is invalid", async () => {
      const result = await deleteTodo({ userId: "u1", id: "badid" });
      expect(result.status).toBe(400);
    });
    it("returns 204 on success", async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const result = await deleteTodo({ userId: "u1", id: "507f1f77bcf86cd799439011" });
      expect(result.status).toBe(204);
    });
    it("returns 404 if not found", async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });
      const result = await deleteTodo({ userId: "u1", id: "507f1f77bcf86cd799439011" });
      expect(result.status).toBe(404);
    });
  });
}); 