// original script for image preview: http:\x2f\x2fwww.cnblogs.com/slyzly/articles/2411940.html by ????
// edited by ar3sgice

//function PreviewImage(fileObj,imgPreviewId,divPreviewId){
function checkFileReaderAvailability()
{
	if(window.FileReader)
	{
		return 1;
	}
	return 0;
}
function saveFileData(d,fn,tp)
{
	if(typeof Blob != 'undefined' && typeof URL.createObjectURL != 'undefined')
	{
		try
		{
			var blob1 = new Blob([d], { "type" : tp });
			$("dl_link").href = URL.createObjectURL(blob1);
			$("dl_link").download = fn;
			$("dl_link").click();
			return;
		}
		catch(c)
		{
		}
	}
	if((typeof canUseDataURL != 'undefined' && !canUseDataURL) || (window.navigator.userAgent.toLowerCase().indexOf("msie") > -1))
	{
		m = window.open();
		if(tp && tp.indexOf("text") == -1 && tp.indexOf("osu") == -1)
		{
			m.document.write(d);
			m.document.title = fn;
			m.document.execCommand("saveAs",false,fn);
		}
		else
		{
			m.document.write("<pre>\ufeff"); // bom of utf-16
			m.document.write(d);
			m.document.write("</pre>");
			m.document.title = fn;
			m.document.execCommand("saveAs",false,fn);
		}
		//m.close();
	}
	else
	{
		tp = tp || "text/plain";
		var u = "data:" + tp + ";base64," + base64encode("\xef\xbb\xbf" + utf16to8(d));
		var m;
		$("dl_link").href = u;
		$("dl_link").download = fn;
		$("dl_link").click();
	}
}
function getFileData(fileObj,readAs,pc) // readAs: "text","dataurl",charset; pc: processing function
{
	var ext = fileObj.value.substring(fileObj.value.lastIndexOf(".")+1).toLowerCase();
	var ua = window.navigator.userAgent.toLowerCase();
	var rd = !!(readAs.toLowerCase().indexOf("dataurl") != -1);
	var cs = rd?"":(readAs.toLowerCase().indexOf("text") != -1?"":readAs);
	if(fileObj.files)
	{ // html5 method
		if(window.FileReader)
		{
			var reader = new FileReader(); 
			reader.onload = function(r)
			{
				r.target?pc(r.target.result):pc(reader.result);
			}  
			rd?reader.readAsDataURL(fileObj.files[0]):reader.readAsText(fileObj.files[0],cs);
			return true;
		}
	}
	else
	{
		return false;
	}
}