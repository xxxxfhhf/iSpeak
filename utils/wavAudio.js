module.exports=function normalizeWav(buffer){
 if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<44)throw new Error('音频文件不完整');
 const out=buffer.slice(0),view=new DataView(out),bytes=new Uint8Array(out);
 const tag=offset=>String.fromCharCode(bytes[offset],bytes[offset+1],bytes[offset+2],bytes[offset+3]);
 if(tag(0)!=='RIFF'||tag(8)!=='WAVE')throw new Error('返回文件不是 WAV 音频');
 let position=12,hasFormat=false,hasData=false;
 while(position+8<=out.byteLength){
  const name=tag(position),length=view.getUint32(position+4,true);
  if(name==='fmt '){if(length<16||position+24>out.byteLength||view.getUint16(position+8,true)!==1||view.getUint16(position+22,true)!==16)throw new Error('不支持的 WAV 编码');hasFormat=true;}
  if(name==='data'){
   const actual=out.byteLength-position-8;
   if(length===0xffffffff||length===0){view.setUint32(position+4,actual,true);}else if(length>actual)throw new Error('音频下载不完整，请重试播放');
   const size=view.getUint32(position+4,true);if(!size||size%2)throw new Error('音频采样不完整');hasData=true;break;
  }
  if(length>out.byteLength-position-8)throw new Error('音频文件头不完整');position+=8+length+(length%2);
 }
 if(!hasFormat||!hasData)throw new Error('音频缺少采样数据');view.setUint32(4,out.byteLength-8,true);return out;
};
