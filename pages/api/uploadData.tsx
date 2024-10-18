import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { GridFSBucket } from "mongodb";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";

// Next.js'in body parsing işlemini devre dışı bırakıyoruz.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const form = formidable({ multiples: false });

    form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        res.status(500).json({ message: "Dosya yükleme hatası" });
        return;
      }

      // `files.file`'in bir dizi olup olmadığını kontrol ediyoruz
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      
      // customFilename bir array olabilir, bunu kontrol ediyoruz
      const customFilename = Array.isArray(fields.customFilename)
        ? fields.customFilename[0] // Dizi ise ilk elemanı al
        : fields.customFilename;    // Değilse olduğu gibi al

      if (!file || !customFilename) {
        res.status(400).json({ message: "Dosya veya dosya adı bulunamadı" });
        return;
      }

      const fileStream = fs.createReadStream(file.filepath);

      try {
        const client = await clientPromise;
        const db = client.db("files_db");

        const bucket = new GridFSBucket(db);

        // Benzersiz bir dosya adı oluştur
        const uniqueFileName = `${Date.now()}_${file.originalFilename || "file.pdf"}`;

        const uploadStream = bucket.openUploadStream(uniqueFileName, {
          metadata: { customFilename }, // Kullanıcı tarafından girilen dosya adı metadata olarak kaydediliyor
        });

        fileStream.pipe(uploadStream);

        uploadStream.on("finish", () => {
          res.status(200).json({ message: "Dosya başarıyla yüklendi", fileId: uploadStream.id });
        });

        uploadStream.on("error", (error) => {
          res.status(500).json({ message: "Yükleme hatası", error });
        });
      } catch (error) {
        res.status(500).json({ message: "Veritabanına bağlanılamadı", error });
      }
    });
  } else {
    res.status(405).json({ message: "Yalnızca POST istekleri desteklenir" });
  }
}
