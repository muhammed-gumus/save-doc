import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Geçersiz dosya ID'si." });
    }

    try {
      const client = await clientPromise;
      const db = client.db("files_db");
      const bucket = new GridFSBucket(db);

      // Dosyayı almak için ID'yi kullan
      const downloadStream = bucket.openDownloadStream(new ObjectId(id));

      // Dosya akışını yanıt olarak gönder
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${id}.pdf"`); // Dosya önizleme için 'inline' ayarı
      
      downloadStream.pipe(res);

      downloadStream.on("error", (error) => {
        console.error("Dosya indirme hatası:", error);
        res.status(404).json({ message: "Dosya bulunamadı." });
      });
    } catch (error) {
      console.error("Dosya indirme hatası:", error);
      res.status(500).json({ message: "Dosya indirme hatası." });
    }
  } else {
    res.status(405).json({ message: "Yalnızca GET istekleri desteklenir." });
  }
}
