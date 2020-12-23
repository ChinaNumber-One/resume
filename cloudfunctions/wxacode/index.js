const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  const wxacodeResult = await cloud.openapi.wxacode.getUnlimited({
    scene: '123456789',
  });
  const uploadResult = await cloud.uploadFile({
    cloudPath: `qrcode/wxacode.jpg`,
    fileContent: wxacodeResult.buffer,
  });
  return uploadResult;
};