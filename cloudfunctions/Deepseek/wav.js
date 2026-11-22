module.exports=function wav(pcm,rate=24000){
 if(!Buffer.isBuffer(pcm)||!pcm.length||pcm.length%2)throw new Error('语音数据不完整，请重试播报');
 const result=Buffer.alloc(44+pcm.length);result.write('RIFF');result.writeUInt32LE(36+pcm.length,4);result.write('WAVEfmt ',8);result.writeUInt32LE(16,16);result.writeUInt16LE(1,20);result.writeUInt16LE(1,22);result.writeUInt32LE(rate,24);result.writeUInt32LE(rate*2,28);result.writeUInt16LE(2,32);result.writeUInt16LE(16,34);result.write('data',36);result.writeUInt32LE(pcm.length,40);pcm.copy(result,44);return result;
};
