import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";
import mime from "mime-types";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "GET") {
    const { id } = req.query;

    // ID kontrolü
    if (!id || typeof id !== "string") {
      res.status(400).json({ message: "Geçersiz dosya ID'si." });
      return;
    }

    try {
      // MongoDB bağlantısı
      const client = await clientPromise;
      const db = client.db("files_db");
      const bucket = new GridFSBucket(db);

      // Dosya hakkında bilgi almak için bucket.find() kullanımı
      const files = await bucket.find({ _id: new ObjectId(id) }).toArray();
      if (!files || files.length === 0) {
        res.status(404).json({ message: "Dosya bulunamadı." });
        return;
      }

      const file = files[0];
      const fileExtension = file.filename.split('.').pop(); // Dosya uzantısını al
      const mimeType = mime.lookup(fileExtension || ""); // MIME türünü belirle

      if (!mimeType) {
        res.status(400).json({ message: "Geçersiz dosya türü." });
        return;
      }

      // Güvenli dosya adı oluşturma
      const safeFilename = file.filename.replace(/[^\w.-]+/g, "_");

      // MIME türünü ve yanıt başlıklarını ayarla
      res.setHeader('Content-Type', mimeType);

      if (fileExtension === 'pdf') {
        res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`); // PDF dosyasını tarayıcıda aç
      } else if (fileExtension === 'docx' || fileExtension === 'xlsx') {
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`); // Word ve Excel dosyalarını indir
      } else {
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`); // Diğer dosyalar için indirme
      }

      // Dosya akışını başlat ve yanıt olarak gönder
      const downloadStream = bucket.openDownloadStream(new ObjectId(id));
      downloadStream.pipe(res);

      // Hata yönetimi
      downloadStream.on("error", (error: Error) => {
        console.error("Dosya indirme hatası:", error);
        res.status(404).json({ message: "Dosya bulunamadı." });
      });

    } catch (error) {
      console.error("Dosya indirme hatası:", error);
      res.status(500).json({ message: "Sunucu hatası." });
    }
  } else {
    res.status(405).json({ message: "Yalnızca GET istekleri desteklenir." });
  }
}
