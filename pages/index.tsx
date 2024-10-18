import { useState, useEffect } from "react";
import { ObjectId } from "mongodb";
import Image from "next/image";
import { FaInfoCircle } from "react-icons/fa"; // Info icon from react-icons

interface FileData {
  _id: ObjectId;
  filename: string;
  uploadDate: Date | string; // Date or string
  metadata?: { customFilename?: string };
}

export default function CatalogPage() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [selectedCustomFilename, setSelectedCustomFilename] =
    useState<string>("");
  const [showInfo, setShowInfo] = useState<{ [key: string]: boolean }>({}); // State to track visibility of info span

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/getData");
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Dosya listesi alınamadı:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const formatFilename = (filename: string) => {
    const index = filename.indexOf("_");
    return index !== -1 ? filename.slice(index + 1) : filename;
  };

  const isPDF = (filename: string) => /\.(pdf)$/.test(filename.toLowerCase());

  // Filter and sort files
  const filteredFiles = files
    .filter(
      (file) =>
        !selectedCustomFilename ||
        file.metadata?.customFilename === selectedCustomFilename
    )
    .sort((a, b) => {
      const aUploadDate =
        typeof a.uploadDate === "string"
          ? new Date(a.uploadDate)
          : a.uploadDate;
      const bUploadDate =
        typeof b.uploadDate === "string"
          ? new Date(b.uploadDate)
          : b.uploadDate;

      if (sortOrder === "newest") {
        return bUploadDate.getTime() - aUploadDate.getTime();
      } else if (sortOrder === "oldest") {
        return aUploadDate.getTime() - bUploadDate.getTime();
      } else if (sortOrder === "a-z") {
        return (
          a.metadata?.customFilename?.localeCompare(
            b.metadata?.customFilename || ""
          ) || 0
        );
      }
      return 0;
    });

  // Get custom filenames
  const customFilenames = Array.from(
    new Set(files.map((file) => file.metadata?.customFilename).filter(Boolean))
  );

  const handleInfoClick = (id: string) => {
    setShowInfo((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setShowInfo((prev) => ({ ...prev, [id]: false }));
    }, 5000); // Hide after 5 seconds
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="w-full mb-6 text-center flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full sm:w-auto px-2 py-2 border rounded"
          >
            <option value="newest">Tarihe göre sıralama (Yeni - Eski)</option>
            <option value="oldest">Tarihe göre sıralama (Eski - Yeni)</option>
            <option value="a-z">Harf sırasına göre (A'dan Z'ye)</option>
          </select>

          <select
            value={selectedCustomFilename}
            onChange={(e) => setSelectedCustomFilename(e.target.value)}
            className="w-full sm:w-auto p-2 border rounded"
          >
            <option value="">Tür</option>
            {customFilenames.map((filename, index) => (
              <option key={index} value={filename}>
                {filename}
              </option>
            ))}
          </select>
        </div>

        {filteredFiles.length > 0 ? (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
    {filteredFiles.map((file) => ( // filteredFiles kullanarak döngü yapıyoruz
      <div
        key={file._id.toString()}
        className="bg-white p-4 rounded-lg overflow-hidden shadow-md transition-transform transform hover:scale-105"
      >
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-gray-700">
            {file.metadata?.customFilename}
          </h2>
          <button
            className="ml-2 text-gray-500"
            onClick={() => handleInfoClick(file._id.toString())}
          >
            <FaInfoCircle color="gray-700" />
          </button>
        </div>

        {/* Info span: only show if `showInfo[file._id]` is true */}
        {showInfo[file._id.toString()] && (
          <span className="text-xs font-bold text-gray-600">
            {formatFilename(file.filename)}
          </span>
        )}

        <div className="border mt-2">
          {isPDF(file.filename) ? (
            <iframe
              src={`/api/getFile?id=${file._id.toString()}#toolbar=0`}
              className="w-full md:h-80 border-none"
              frameBorder="0"
              style={{ border: "none" }}
            />
          ) : (
            <Image
              src={"/images/empty-img.png"}
              alt="File not PDF"
              width={200}
              height={200}
              className="w-full md:h-80 object-cover"
            />
          )}
        </div>

        <div className="pt-4">
          <a
            href={`/api/downloadFile?id=${file._id.toString()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-red-700 text-white text-center px-4 py-2 rounded hover:bg-red-800 transition"
          >
            Dosyayı Aç
          </a>
        </div>
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-600 text-center mt-8">
    Henüz yüklenen dosya yok.
  </p>
)}

      </div>
    </div>
  );
}
