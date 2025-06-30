import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from 'dotenv'
import path from 'path'

if (process.env.NODE_ENV == 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
} else {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const s3 = new S3Client({
  region: `${process.env.AWS_REGION}`,
  credentials: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
    secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  },
});

export async function uploadFile(file: Express.Multer.File): Promise<string> {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  const params = {
    Bucket: `${process.env.AWS_BUCKET_NAME}`,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

    try {
        await s3.send(new PutObjectCommand(params));
    } catch (err) {
        console.error("Error uploading to S3:", err);
        throw err;
    }

  return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

/***************************** */

// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { ObjectCannedACL } from "@aws-sdk/client-s3";
// import { v4 as uuidv4 } from "uuid";
// import dotenv from 'dotenv';
// import path from 'path';

// if (process.env.NODE_ENV === 'production') {
//   dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
// } else {
//   dotenv.config({ path: path.resolve(__dirname, '../.env') });
// }

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   endpoint: process.env.AWS_S3_LOCAL_ENDPOINT || undefined,
//   forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
//   credentials: {
//     accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
//     secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
//   },
// });

// export async function uploadFile(file: Express.Multer.File): Promise<string> {
//   const fileExt = file.originalname.split(".").pop();
//   const fileName = `${uuidv4()}.${fileExt}`;

//   const params = {
//     Bucket: `${process.env.AWS_BUCKET_NAME}`,
//     Key: fileName,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//     ACL: "public-read" as ObjectCannedACL,
//   };

//   try {
//     await s3.send(new PutObjectCommand(params));
//   } catch (err) {
//     console.error("Error uploading to S3:", err);
//     throw err;
//   }

//   const baseUrl =
//     process.env.AWS_S3_LOCAL_ENDPOINT && process.env.NODE_ENV !== 'production'
//       ? `${process.env.AWS_S3_LOCAL_ENDPOINT}/${params.Bucket}`
//       : `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`;

//   return `${baseUrl}/${fileName}`;
// }
