// src/services/document.service.ts
import Document, { DocumentPrivacyLevel } from "../models/document.model";
import User from "../models/user.model";
import Department from "../models/department.model";
import Division from "../models/division.model";
import Unit from "../models/unit.model";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";

interface DocumentCreationDTO {
  title: string;
  description?: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  creatorId: string;
  privacyLevel?: DocumentPrivacyLevel;
  departmentId?: string;
  divisionId?: string;
  unitId?: string;
}

interface DocumentUpdateDTO {
  title?: string;
  description?: string;
  privacyLevel?: DocumentPrivacyLevel;
  departmentId?: string;
  divisionId?: string;
  unitId?: string;
}

class DocumentService {
  // Create a new document
  async createDocument(documentData: DocumentCreationDTO): Promise<Document> {
    try {
      // Validate creator exists
      const creator = await User.findByPk(documentData.creatorId);
      if (!creator) {
        throw new Error("Invalid creator");
      }

      // Validate organizational hierarchy if provided
      if (documentData.departmentId) {
        const department = await Department.findByPk(documentData.departmentId);
        if (!department) {
          throw new Error("Invalid department");
        }
      }

      if (documentData.divisionId) {
        const division = await Division.findByPk(documentData.divisionId);
        if (!division) {
          throw new Error("Invalid division");
        }
      }

      if (documentData.unitId) {
        const unit = await Unit.findByPk(documentData.unitId);
        if (!unit) {
          throw new Error("Invalid unit");
        }
      }

      // Create document
      return await Document.create({
        ...documentData,
        id: uuidv4(),
        uploadDate: new Date(),
        versionNumber: 1,
        isActive: true,
        privacyLevel: documentData.privacyLevel || DocumentPrivacyLevel.PUBLIC,
      });
    } catch (error) {
      console.error("Document creation error:", error);
      throw error;
    }
  }

  // Update document details
  async updateDocument(
    documentId: string,
    updateData: DocumentUpdateDTO
  ): Promise<Document> {
    try {
      const document = await Document.findByPk(documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // Validate organizational hierarchy if provided
      if (updateData.departmentId) {
        const department = await Department.findByPk(updateData.departmentId);
        if (!department) {
          throw new Error("Invalid department");
        }
      }

      if (updateData.divisionId) {
        const division = await Division.findByPk(updateData.divisionId);
        if (!division) {
          throw new Error("Invalid division");
        }
      }

      if (updateData.unitId) {
        const unit = await Unit.findByPk(updateData.unitId);
        if (!unit) {
          throw new Error("Invalid unit");
        }
      }

      return await document.update(updateData);
    } catch (error) {
      console.error("Document update error:", error);
      throw error;
    }
  }

  // Create a new version of an existing document
  async createDocumentVersion(
    documentId: string,
    newDocumentData: Omit<DocumentCreationDTO, "creatorId">
  ): Promise<Document> {
    try {
      const existingDocument = await Document.findByPk(documentId);

      if (!existingDocument) {
        throw new Error("Original document not found");
      }

      // Create new document version
      return await Document.create({
        ...newDocumentData,
        id: uuidv4(),
        creatorId: existingDocument.creatorId,
        uploadDate: new Date(),
        versionNumber: existingDocument.versionNumber + 1,
        isActive: true,
      });
    } catch (error) {
      console.error("Document version creation error:", error);
      throw error;
    }
  }

  // Get document by ID with associated data
  async getDocumentById(documentId: string) {
    return await Document.findByPk(documentId, {
      include: [
        { model: User, as: "creator" },
        { model: Department, as: "department" },
        { model: Division, as: "division" },
        { model: Unit, as: "unit" },
      ],
    });
  }

  // Soft delete document
  async deactivateDocument(documentId: string): Promise<void> {
    const document = await Document.findByPk(documentId);

    if (!document) {
      throw new Error("Document not found");
    }

    await document.update({ isActive: false });
  }

  // List documents with optional filtering
  async listDocuments(
    filters: {
      creatorId?: string;
      privacyLevel?: DocumentPrivacyLevel;
      departmentId?: string;
      divisionId?: string;
      unitId?: string;
      isActive?: boolean;
      fileType?: string;
    } = {}
  ) {
    return await Document.findAll({
      where: filters,
      include: [
        { model: User, as: "creator" },
        { model: Department, as: "department" },
        { model: Division, as: "division" },
        { model: Unit, as: "unit" },
      ],
      order: [["uploadDate", "DESC"]],
    });
  }

  // Search documents
  async searchDocuments(
    searchTerm: string,
    filters: {
      privacyLevel?: DocumentPrivacyLevel;
      departmentId?: string;
      divisionId?: string;
      unitId?: string;
      isActive?: boolean;
    } = {}
  ) {
    return await Document.findAll({
      where: {
        ...filters,
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { fileType: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      include: [
        { model: User, as: "creator" },
        { model: Department, as: "department" },
        { model: Division, as: "division" },
        { model: Unit, as: "unit" },
      ],
      order: [["uploadDate", "DESC"]],
    });
  }

  // Get document versions
  async getDocumentVersions(documentTitle: string) {
    return await Document.findAll({
      where: { title: documentTitle },
      order: [["versionNumber", "DESC"]],
      include: [
        { model: User, as: "creator" },
        { model: Department, as: "department" },
        { model: Division, as: "division" },
        { model: Unit, as: "unit" },
      ],
    });
  }
}

export default new DocumentService();
