import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Tag,
  Calendar,
  Image,
  Clipboard,
  AlertTriangle,
  Loader2,
  Download,
} from "lucide-react";
import { useIndexedDB } from "../hooks/useIndexedDB";

const DOCUMENT_TYPES = [
  { id: "dpe", label: "DPE", icon: "📊" },
  { id: "invoice", label: "Facture", icon: "🧾" },
  { id: "contract", label: "Contrat", icon: "📄" },
  { id: "warranty", label: "Garantie", icon: "🛡️" },
  { id: "maintenance", label: "Entretien", icon: "🔧" },
  { id: "other", label: "Autre", icon: "📎" },
];

export default function Documents() {
  const { documents, loading, error, addDocument, deleteDocument } =
    useIndexedDB();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "invoice",
    date: "",
    notes: "",
    content: "",
    mimeType: "",
    fileExtension: "",
  });
  const fileInputRef = useRef(null);

  // Helper to download a file from base64 data URL
  const downloadFile = (dataUrl, filename) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileName = file.name;
      // Read file as base64 for storage and download
      const reader = new FileReader();
      const content = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Determine preview
      let previewUrl = null;
      let previewType = "other";
      if (file.type.startsWith("image/")) {
        previewUrl = URL.createObjectURL(file);
        previewType = "image";
      } else if (file.type === "application/pdf") {
        previewUrl = URL.createObjectURL(file);
        previewType = "pdf";
      }

      // Set form data with file content stored as base64
      const fileExtension = fileName.split(".").pop();
      setFormData({
        name: fileName.replace(/\.[^/.]+$/, ""),
        type: "other",
        date: "",
        notes: "",
        content: content, // base64 data URL
        mimeType: file.type,
        fileExtension: fileExtension,
      });

      setFileToUpload(file);
      setPreview({ url: previewUrl, type: previewType, name: fileName });
    } catch (error) {
      console.error("File processing error:", error);
      // Fallback to basic handling
      const fileName = file.name;
      setFormData((prev) => ({
        ...prev,
        name: fileName.replace(/\.[^/.]+$/, ""),
        type: "other",
        content: "",
      }));
      setFileToUpload(file);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const type = DOCUMENT_TYPES.find((t) => t.id === formData.type);
    const newDoc = {
      ...formData,
      icon: type?.icon || "📎",
      createdAt: new Date().toISOString(),
    };
    addDocument(newDoc);

    // Reset form
    setFormData({
      name: "",
      type: "invoice",
      date: "",
      notes: "",
      content: "",
      mimeType: "",
      fileExtension: "",
    });
    setShowForm(false);
    setPreview(null);
    setFileToUpload(null);

    // Revoke object URL if any
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Supprimer ce document ?")) {
      deleteDocument(id);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Chargement des documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          Erreur lors du chargement des documents
        </p>
        <p className="text-slate-400">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Documents</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Ajouter
          </button>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded p-4 text-center ${
              dragOver
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <p className="text-sm text-slate-500">Ou déposez un fichier ici</p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom du document
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Facture EDF Janvier 2026"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date du document
            </label>
            <input
              type="date"
              className="input"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Remarques, montant, référence..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({
                  name: "",
                  type: "invoice",
                  date: "",
                  notes: "",
                  content: "",
                  mimeType: "",
                  fileExtension: "",
                });
                setPreview(null);
                setFileToUpload(null);
                if (preview?.url) {
                  URL.revokeObjectURL(preview.url);
                }
              }}
              className="btn btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucun document enregistré</p>
          <p className="text-sm text-slate-400 mt-1">
            Ajoutez vos DPE, factures, contrats...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const type = DOCUMENT_TYPES.find((t) => t.id === doc.type);
            return (
              <div key={doc.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{doc.icon}</span>
                    <div>
                      <h3 className="font-semibold">{doc.name}</h3>
                      <p className="text-sm text-slate-500">{type?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.content && doc.mimeType && (
                      <button
                        onClick={() =>
                          downloadFile(
                            doc.content,
                            `${doc.name}.${doc.fileExtension || "pdf"}`
                          )
                        }
                        className="p-2 text-slate-400 hover:text-blue-500"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {doc.date && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(doc.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                )}

                {doc.notes && (
                  <p className="mt-2 text-sm text-slate-500 bg-slate-50 rounded-lg p-2">
                    {doc.notes}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span className="badge badge-blue">{type?.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}