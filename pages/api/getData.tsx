// pages/api/getData.ts

import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { ObjectId, GridFSBucket } from "mongodb";
import { metadata } from "@/app/layout";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { id } = req.query;

    try {
      const client = await clientPromise;
      const db = client.db("files_db");

      const bucket = new GridFSBucket(db, {
        bucketName: "fs", // GridFS'in varsayılan bucket ismi
      });

      // Eğer ID verilmişse, ilgili dosyanın bilgilerini getir
      if (id && typeof id === "string") {
        // Burada id'nin string olduğunu kontrol ediyoruz
        const file = await bucket.find({ _id: new ObjectId(id) }).toArray();
        if (file.length > 0) {
          // Dosya bilgilerini döndür
          res.status(200).json({
            _id: file[0]._id,
            filename: file[0].filename,
          });
        } else {
          res.status(404).json({ message: "Dosya bulunamadı." });
        }
      } else {
        // Tüm dosyaların bilgilerini al
        const filesCursor = await bucket.find(); // Tüm dosyaları al
        const files = await filesCursor.toArray(); // Cursor'dan diziyi oluştur
        const fileData = files.map((file) => ({
          _id: file._id,
          filename: file.filename,
          metadata: file.metadata,
          uploadDate: file.uploadDate,
        }));

        res.status(200).json(fileData); // Dosya bilgilerini döndür
      }
    } catch (error) {
      console.error("GridFS Hatası: ", error);
      res.status(500).json({ message: "Dosya listesi alınamadı", error });
    }
  } else {
    res.status(405).json({ message: "Yalnızca GET istekleri desteklenir" });
  }
}
