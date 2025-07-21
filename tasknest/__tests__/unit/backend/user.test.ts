import { getUserProfile, updateUserProfile, changeUserPassword } from "../../../app/api/user/logic";
import bcrypt from "bcrypt";

const mockCollection = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn(),
};

jest.mock("../../../app/server/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve({
    db: () => ({
      collection: () => mockCollection,
    }),
  }),
}));

jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("User API Logic", () => {
  beforeEach(() => {
    Object.values(mockCollection).forEach(fn => {
      if (typeof fn === 'function' && 'mockClear' in fn) fn.mockClear();
    });
    jest.clearAllMocks();
  });

  describe("getUserProfile", () => {
    it("returns 401 if not authorized", async () => {
      const result = await getUserProfile({ userId: "" });
      expect(result.status).toBe(401);
    });
    it("returns 404 if user not found", async () => {
      mockCollection.findOne.mockResolvedValue(null);
      const result = await getUserProfile({ userId: "507f1f77bcf86cd799439011" });
      expect(result.status).toBe(404);
    });
    it("returns 200 and user profile on success", async () => {
      mockCollection.findOne.mockResolvedValue({ name: "Test", email: "test@example.com" });
      const result = await getUserProfile({ userId: "507f1f77bcf86cd799439011" });
      expect(result.status).toBe(200);
      expect(result.body.name).toBe("Test");
      expect(result.body.email).toBe("test@example.com");
    });
  });

  describe("updateUserProfile", () => {
    it("returns 401 if not authorized", async () => {
      const result = await updateUserProfile({ userId: "", name: "Test" });
      expect(result.status).toBe(401);
    });
    it("returns 400 if name is missing", async () => {
      const result = await updateUserProfile({ userId: "507f1f77bcf86cd799439011", name: "" });
      expect(result.status).toBe(400);
    });
    it("returns 404 if user not found", async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue({ value: null });
      mockCollection.findOne.mockResolvedValue(null);
      const result = await updateUserProfile({ userId: "507f1f77bcf86cd799439011", name: "Test" });
      expect(result.status).toBe(404);
    });
    it("returns 200 and updated user on success", async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue({ value: { name: "Test", email: "test@example.com" } });
      const result = await updateUserProfile({ userId: "507f1f77bcf86cd799439011", name: "Test" });
      expect(result.status).toBe(200);
      expect(result.body.user.name).toBe("Test");
    });
  });

  describe("changeUserPassword", () => {
    it("returns 401 if not authorized", async () => {
      const result = await changeUserPassword({ userId: "", currentPassword: "old", newPassword: "new" });
      expect(result.status).toBe(401);
    });
    it("returns 400 if missing passwords", async () => {
      const result = await changeUserPassword({ userId: "507f1f77bcf86cd799439011", currentPassword: "", newPassword: "" });
      expect(result.status).toBe(400);
    });
    it("returns 404 if user not found", async () => {
      mockCollection.findOne.mockResolvedValue(null);
      const result = await changeUserPassword({ userId: "507f1f77bcf86cd799439011", currentPassword: "old", newPassword: "new" });
      expect(result.status).toBe(404);
    });
    it("returns 401 if current password is incorrect", async () => {
      mockCollection.findOne.mockResolvedValue({ password: "hashed" });
      (mockedBcrypt.compare as any).mockResolvedValue(false);
      const result = await changeUserPassword({ userId: "507f1f77bcf86cd799439011", currentPassword: "old", newPassword: "new" });
      expect(result.status).toBe(401);
    });
    it("returns 200 on success", async () => {
      mockCollection.findOne.mockResolvedValue({ password: "hashed" });
      (mockedBcrypt.compare as any).mockResolvedValue(true);
      (mockedBcrypt.hash as any).mockResolvedValue("hashedNew");
      mockCollection.updateOne.mockResolvedValue({});
      const result = await changeUserPassword({ userId: "507f1f77bcf86cd799439011", currentPassword: "old", newPassword: "new" });
      expect(result.status).toBe(200);
      expect(result.body.message).toBe("Password changed successfully");
    });
  });
}); 