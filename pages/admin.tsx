import { useState, useEffect } from "react";
import { ObjectId } from "mongodb";

interface FileData {
  _id: ObjectId;
  filename: string;
  metadata?: { customFilename?: string }; // Metadata bir nesne olarak tanımlanmalı
}

export default function Admin() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [customFilename, setCustomFilename] = useState<string>(""); // Yeni state

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFilenameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomFilename(event.target.value); // Dosya adı girişini güncelle
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || !customFilename) {
      setMessage("Lütfen dosya ve dosya adını girin.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("customFilename", customFilename); // Text input verisi ekleniyor

    setLoading(true);

    try {
      const response = await fetch("/api/uploadData", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Dosya başarıyla yüklendi.");
        setSelectedFile(null);
        setCustomFilename(""); // Dosya adı temizleniyor
        fetchFiles();
      } else {
        setMessage("Dosya yükleme başarısız oldu.");
      }
    } catch (error) {
      console.error("Yükleme hatası:", error);
      setMessage("Dosya yükleme hatası.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/getData");
      const data = await response.json();
      setFiles(data);
      console.log("dosyalar" + files[0].metadata?.customFilename);
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

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl w-full h-1/2 bg-white p-6 rounded-lg shadow-lg">
        {/* <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Dosya Yükle
        </h1> */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col items-center"
        >
          <input
            type="text"
            placeholder="Dosya türü girin"
            value={customFilename}
            onChange={handleFilenameChange}
            className="w-full border p-2 rounded"
          />

          <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-200 text-red-700 rounded-lg tracking-wide uppercase border border-gray-300 cursor-pointer hover:bg-gray-300 transition duration-300">
            <svg
              className="w-12 h-12 text-red-700"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M6 2c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h12c.6 0 1-.4 1-1V7.6L14.4 2H6z"
                fill="#dc2626"
              />
              <path d="M15 2.2V6c0 .6.4 1 1 1h3.8L15 2.2z" fill="#e3342f" />
              <text
                x="5.5"
                y="18"
                fontSize="6"
                fill="white"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="bold"
              >
                PDF
              </text>
            </svg>

            <span className="mt-2 text-red-700 font-bold text-base leading-normal">
              {selectedFile ? selectedFile.name : "Dosya Seç"}
            </span>
            <input
              type="file"
              accept=".docx, .xlsx, .pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-red-700 text-white py-2 rounded-lg hover:bg-red-800 transition duration-300"
          >
            Yükle
          </button>
        </form>

        {loading && (
          <div className="flex items-center justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-700"></div>
          </div>
        )}

        {message && <p className="text-red-500 text-center mt-4">{message}</p>}

        <h2 className="text-xl font-semibold mt-6 text-gray-700">
          Yüklenen Dosyalar
        </h2>
        {files.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {files.map((file) => (
              <li
                key={file._id.toString()}
                className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm mb-2"
              >
                <div className="flex-1">
                  <span className="text-red-500 block mt-1 text-lg sm:text-base">
                    {file.metadata?.customFilename}
                  </span>
                  <span
                    className="text-gray-600 block overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-[150px] md:max-w-lg transition-all duration-300 text-xs sm:text-xs"
                    title={formatFilename(file.filename)} // Tooltip için tam dosya adını göster
                  >
                    {formatFilename(file.filename)}
                  </span>
                </div>
                <a
                  href={`/api/downloadFile?id=${file._id.toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-700 text-white px-6 py-1 rounded hover:bg-black hover:text-white transition duration-300 text-sm sm:text-base"
                >
                  Aç
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-gray-600">Henüz yüklenen dosya yok.</p>
        )}
      </div>
    </div>
  );
}

// import { useState, useEffect } from "react";
// import { ObjectId } from "mongodb";

// interface FileData {
//   _id: ObjectId;
//   filename: string;
// }

// export default function Admin() {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [files, setFiles] = useState<FileData[]>([]);
//   const [message, setMessage] = useState<string>("");
//   const [previewFile, setPreviewFile] = useState<string | null>(null); // State for preview file

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files && event.target.files.length > 0) {
//       setSelectedFile(event.target.files[0]);
//     }
//   };

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (!selectedFile) {
//       setMessage("Lütfen bir dosya seçin.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       const response = await fetch("/api/uploadData", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         setMessage("Dosya başarıyla yüklendi.");
//         setSelectedFile(null);
//         fetchFiles(); // Dosya yüklendikten sonra dosya listesini yenile
//       } else {
//         setMessage("Dosya yükleme başarısız oldu.");
//       }
//     } catch (error) {
//       console.error("Yükleme hatası:", error);
//       setMessage("Dosya yükleme hatası.");
//     }
//   };

//   const fetchFiles = async () => {
//     try {
//       const response = await fetch("/api/getData");
//       const data = await response.json();
//       setFiles(data);
//     } catch (error) {
//       console.error("Dosya listesi alınamadı:", error);
//     }
//   };

//   useEffect(() => {
//     fetchFiles();
//   }, []);

//   // _ karakterinden sonrasını göstererek dosya adını düzenleme
//   const formatFilename = (filename: string) => {
//     const index = filename.indexOf("_");
//     return index !== -1 ? filename.slice(index + 1) : filename; // Eğer _ yoksa tam dosya adını göster
//   };

//   // Handle PDF preview
//   const handlePreview = (fileId: string) => {
//     setPreviewFile(`/api/getFile?id=${fileId}`);
//   };

//   return (
//     <div className="max-w-xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Dosya Yükle ve Listele</h1>

//       <form onSubmit={handleSubmit} className="mb-4 flex justify-center items-center">
//         <input
//           type="file"
//           onChange={handleFileChange}
//           className="border border-gray-300 rounded p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-red-500"
//         />
//         <button
//           type="submit"
//           className="bg-red-700 text-white px-6 py-2 rounded hover:bg-red-800 transition duration-300"
//         >
//           Yükle
//         </button>
//       </form>

//       {message && <p className="text-red-500 text-center">{message}</p>}

//       <h2 className="text-2xl font-semibold mt-4 text-gray-700">Yüklenen Dosyalar</h2>
//       {files.length > 0 ? (
//         <ul className="list-disc list-inside mt-4">
//           {files.map((file) => (
//             <li key={file._id.toString()} className="mb-2 flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md shadow-sm">
//               <span className="mr-4 text-gray-600">{formatFilename(file.filename)}</span>
//               <div>
//                 {/* <button
//                   onClick={() => handlePreview(file._id.toString())}
//                   className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition duration-300 mr-2"
//                 >
//                   Önizle
//                 </button> */}
//                 <a
//                   href={`/api/getFile?id=${file._id.toString()}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800 transition duration-300"
//                 >
//                   Aç
//                 </a>
//               </div>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="mt-2 text-gray-600">Henüz yüklenen dosya yok.</p>
//       )}

//       {/* PDF Preview Section
//       {previewFile && (
//         <div className="mt-6 p-4 border border-gray-300 rounded bg-white">
//           <h2 className="text-xl font-semibold mb-2">PDF Önizleme</h2>
//           <iframe
//             src={previewFile}
//             width="100%"
//             height="500"
//             title="PDF Preview"
//             className="border border-gray-300"
//           />
//           <button
//             onClick={() => setPreviewFile(null)}
//             className="mt-2 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition duration-300"
//           >
//             Kapat
//           </button>
//         </div>
//       )} */}
//     </div>
//   );
// }
