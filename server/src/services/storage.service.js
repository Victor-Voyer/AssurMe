const crypto = require('crypto');
const AWS = require('aws-sdk');

const isS3Configured = () =>
  process.env.AWS_ACCESS_KEY_ID
  && process.env.AWS_ACCESS_KEY_ID !== 'your_key'
  && process.env.AWS_SECRET_ACCESS_KEY
  && process.env.AWS_SECRET_ACCESS_KEY !== 'your_secret';

const getS3 = () => {
  if (!isS3Configured()) return null;
  return new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
};

const uploadToS3 = async (file) => {
  const key = `contracts/${crypto.randomUUID()}-${file.originalname}`;

  const s3 = getS3();
  if (!s3) {
    return `local://${key}`;
  }

  await s3
    .upload({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
    .promise();

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

module.exports = { uploadToS3 };
