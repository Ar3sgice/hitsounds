function br_open()
{
	if(!is_map_loaded)
	{
		output("No map data!");
		return;
	}
	$("float_breakmap").style.display = "block";
}

function br_close()
{
	$("float_breakmap").style.display = "none";
}

function randbetween(a,b)
{
	return Math.floor(a + Math.random() * (b-a+1));
}

function randsign()
{
	return (Math.random() > 0.5)?1:-1;
}

function isOutside(x,y)
{
	return (x < 0) || (y < 0) || (x > 512) || (y > 384);
}

function distance(x1,y1,x2,y2)
{
	return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

function approxEqual(a,b)
{
	return (Math.abs(a-b) < 0.0001);
}

function br_do()
{
}

function breakmap1()
{
	if(hitObjectArray.length == 0) { output("No object!"); return 0; }
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	var prevX = -999;
	var prevY = -999;
	var minDist = 75;
	for(var i=0;i<hitObjectArray.length;i++)
	{
		var obj = hitObjectArray[i];
		if(obj.time >= dTimeStart && obj.time <= dTimeEnd)
		{
			do
			{
				obj.x = randbetween(0,512);
				obj.y = randbetween(0,384);
			}
			while(distance(prevX,prevY,obj.x,obj.y) < minDist);
			prevX = obj.x;
			prevY = obj.y;
		}
	}
	output("breakmap1 complete!")
	diffname_buff("bm1");
	br_close();
}

function breakmap4()
{
	if(hitObjectArray.length == 0) { output("No object!"); return 0; }
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	var prevX = -999;
	var prevY = -999;
	var minDist = 75;
	var tX = 0;
	var tY = 0;
	var tA = 0;
	var minStreamDist = 30;
	var maxStreamDist = 40;
	var minJumpDist = 100;
	var maxJumpDist = 300;
	var bA = -1;
	var tR = 0;
	var JnS = 0;
	var sN = 0;
	var cSD = 40;
	var borderline = 150;
	for(var i=0;i<hitObjectArray.length;i++)
	{
		var obj = hitObjectArray[i];
		if(obj.time >= dTimeStart && obj.time <= dTimeEnd)
		{
			var prevObj = hitObjectArray[i-1];
			if(prevX < 0)
			{
				obj.x = randbetween(0,512);
				obj.y = randbetween(0,384);
			}
			else if(bA < 0)
			{
				JnS = (divisorBetween(obj,prevObj) > 2/5);
				do
				{
					tA = Math.random() * 2 * Math.PI;
					tR = randbetween(JnS?minJumpDist:minStreamDist,JnS?maxJumpDist:maxStreamDist);
					tX = prevX + tR * Math.cos(tA);
					tY = prevY + tR * Math.sin(tA);
				}
				while(isOutside(tX,tY));
				obj.x = Math.round(tX);
				obj.y = Math.round(tY);
			}
			else
			{
				JnS = (divisorBetween(obj,prevObj) > 2/5);
				var tryN = 0;
				var iWL2 = (isWhiteLine2(obj.time,1) % 2 == 1);
				do
				{
					if(tryN < 10 && !iWL2)
					{
						tA = JnS?(Math.random() * 2 * Math.PI):((bA + randsign() * Math.random() * Math.random() / 12 * 2 * Math.PI) % (2 * Math.PI));
						tryN++;
					}
					else if(tryN < 10 && iWL2)
					{
						if(prevX < borderline && prevY < borderline)
						{
							tA = Math.PI/6 + randsign() * Math.random() * 8 * Math.PI;
						}
						else if(prevX > 512 - borderline && prevY < borderline)
						{
							tA = 5*Math.PI/6 + randsign() * Math.random() * 8 * Math.PI;
						}
						else if(prevX < borderline && prevY > 384 - borderline)
						{
							tA = 11*Math.PI/6 + randsign() * Math.random() * 8 * Math.PI;
						}
						else if(prevX > 512 - borderline && prevY > 384 - borderline)
						{
							tA = 7*Math.PI/6 + randsign() * Math.random() * 8 * Math.PI;
						}
						else
						{
							tA = Math.random() * 2 * Math.PI;
						}
					}
					else
					{
						tA = Math.random() * 2 * Math.PI;
					}
					tR = (!JnS&&cSD)?cSD:randbetween(JnS?minJumpDist:minStreamDist,JnS?maxJumpDist:maxStreamDist);
					if(iWL2 && !JnS)
					{
						tR = randbetween(3*minStreamDist,3*maxStreamDist);
					}
					tX = prevX + tR * Math.cos(tA);
					tY = prevY + tR * Math.sin(tA);
				}
				while(isOutside(tX,tY));
				obj.x = Math.round(tX);
				obj.y = Math.round(tY);
				if(!JnS)
				{
					sN++;
					if(!iWL2)
					{
						cSD = tR;
					}
				}
				else
				{
					sN = 0;
					cSD = 0;
				}
			}
			prevX = obj.x;
			prevY = obj.y;
			if(sN > 1)
			{
				//bA = (bA * (sN - 1) + tA) / sN;
				bA = tA;
			}
			else
			{
				bA = tA;
			}
		}
	}
	output("breakmap4 complete!")
	diffname_buff("bm4");
	br_close();
}

function divisorBetween(a,b)
{
	return Math.round(24 * Math.abs(b.time-a.time) / Math.abs(getTickLen(a.time))) / 24;
}

function divisorBetween2(a,b)
{
	if(a.time < b.time && a.type & 2)
	{
		var ticks = a.sliderLength / getSliderLen(a.time);
		var tickLength = getTickLen(a.time);
		var at = Math.round(a.time + a.sliderReverses * ticks * tickLength);
	}
	else
	{
		var at = a.time;
	}
	if(b.time < a.time && b.type & 2)
	{
		var ticks = b.sliderLength / getSliderLen(b.time);
		var tickLength = getTickLen(b.time);
		var bt = Math.round(b.time + b.sliderReverses * ticks * tickLength);
	}
	else
	{
		var bt = b.time;
	}
	return Math.round(24 * Math.abs(bt-at) / Math.abs(getTickLen(at))) / 24;
}

function sliderTransform()
{
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	var outArray = [];
	var obj = null;
	for(var i=0;i<hitObjectArray.length;i++)
	{
		obj = hitObjectArray[i];
		if(obj.time < dTimeStart || obj.time > dTimeEnd)
		{
			outArray.push(obj);
			continue;
		}
		if(hitObjectArray[i].type & 1)
		{
			outArray.push(obj);
		}
		else if(obj.type & 2)
		{
			var ticks = obj.sliderLength / getSliderLen(obj.time);
			var tickLength = getTickLen(obj.time);
			if(!obj.sliderSingleHitsounds)
			{
				obj.sliderSingleHitsounds = [];
				for(var j=0;j<=obj.sliderReverses;j++)
				{
					obj.sliderSingleHitsounds.push(obj.hitsounds);
				}
			}
			if(!obj.sliderExtHitsounds)
			{
				obj.sliderExtHitsounds = [];
				for(var j=0;j<=obj.sliderReverses;j++)
				{
					obj.sliderExtHitsounds.push("0:0");
				}
				obj.extHitsounds = "0:0:0";
			}
			for(var j=0;j<=obj.sliderReverses;j++)
			{
				var c_tick = Math.round(obj.time + j * ticks * tickLength);
				var endpoint = obj.sliderPoints[obj.sliderPoints.length-1].split(":");
				var v = {};
				v.x = (j%2==0)?obj.x:parseInt(endpoint[0]);
				v.y = (j%2==0)?obj.y:parseInt(endpoint[1]);
				v.time = c_tick;
				v.type = (j==0)?(obj.type - 1):1;
				v.hitsounds = obj.sliderSingleHitsounds[j];
				v.extHitsounds = obj.sliderExtHitsounds[j] + ":0";
				v.sliderPoints = false;
				v.sliderReverses = false;
				v.sliderLength = false;
				v.sliderSingleHitsounds = false;
				v.index = outArray.length;
				outArray.push(v);
			}
		}
		else if(obj.type & 8)
		{
			var v = {};
			v.x = obj.x;
			v.y = obj.y;
			v.time = obj.time;
			v.type = 1;
			v.hitsounds = obj.hitsounds;
			v.extHitsounds = "0:0:0";
			v.sliderPoints = false;
			v.sliderReverses = false;
			v.sliderLength = false;
			v.sliderSingleHitsounds = false;
			v.index = outArray.length;
			outArray.push(v);
		}
	}
	hitObjectArray = outArray;
}

function sliderTransformTest()
{
	if(!hitObjectArray.length) { output("No object!"); return 0; }
	sliderTransform();
	output("sliderTransform complete!")
	diffname_buff("ST");
	br_close();
}

function removeLessThan4ths()
{
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	var outArray = [];
	for(var i=1;i<hitObjectArray.length;i++)
	{
		var obj = hitObjectArray[i];
		if(obj.time >= dTimeStart && obj.time <= dTimeEnd)
		{
			var prevObj = outArray[outArray.length-1] || hitObjectArray[i-1];
			if(divisorBetween(obj,prevObj) > 1/5)
			{
				outArray.push(obj);
			}
		}
		else
		{
			outArray.push(obj);
		}
	}
	hitObjectArray = outArray;
}

function breakmap3()
{
	if(hitObjectArray.length <= 1) { output("No object!"); return 0; }
	sliderTransform();
	removeLessThan4ths();
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	var minDist = 75;
	var minRadius = 120;
	var maxRadius = 240;
	var cX = hitObjectArray[0].x;
	var cY = hitObjectArray[0].y;
	var bX = 0;
	var bY = 0;
	var bA = 0;
	var bR = 0;
	var eA = 0;
	var sd = 0;
	var eN = 0;
	var minSD = 30;
	var maxSD = 40;
	var acF = 0;
	var j = 0;
	var thisObj = null;
	var thisPrevObj = null;
	var prevX = hitObjectArray[0].x;
	var prevY = hitObjectArray[0].y;
	for(var i=1;i<hitObjectArray.length;i++)
	{
		var obj = hitObjectArray[i];
		if(obj.time >= dTimeStart && obj.time <= dTimeEnd)
		{
			var prevObj = hitObjectArray[i-1];
			if(divisorBetween(obj,prevObj) > 1/3)
			{
				do
				{
					acF = true;
					cX = randbetween(0 - minRadius,512 + minRadius);
					cY = randbetween(0 - minRadius,384 + minRadius);
					bA = Math.random() * 2 * Math.PI;
					bR = randbetween(minRadius,maxRadius);
					sd = randbetween(minSD,maxSD);
					eA = 2 * randsign() * Math.asin(sd / (2 * bR));
					bX = cX + bR * Math.cos(bA);
					bY = cY + bR * Math.sin(bA);
					thisPrevObj = obj;
					if(distance(bX,bY,prevX,prevY) < minDist || isOutside(bX,bY))
					{
						acF = false;
					}
					for(j=i+1;j<hitObjectArray.length;j++)
					{
						if(!acF)
						{
							break;
						}
						thisObj = hitObjectArray[j];
						if(divisorBetween(thisObj,thisPrevObj) > 1/3)
						{
							break;
						}
						else if(isOutside(cX + bR * Math.cos(bA + (j-i) * eA),cY + bR * Math.sin(bA + (j-i) * eA)))
						{
							acF = false;
							break;
						}
						thisPrevObj = thisObj;
					}
				}
				while(!acF);
				eN = 0;
				obj.x = Math.round(bX);
				obj.y = Math.round(bY);
				prevX = obj.x;
				prevY = obj.y;
			}
			else if(eN >= 8 && isWhiteLine(obj.time) && Math.random() < 1/2)
			{
				eN++;
				bX = cX + bR * Math.cos(bA + eN * eA);
				bY = cY + bR * Math.sin(bA + eN * eA);
				var CYC = 222;
				do
				{
					--CYC;
					acF = true;
					bA = Math.random() * 2 * Math.PI;
					bR = randbetween(minRadius,maxRadius);
					sd = randbetween(minSD,maxSD);
					eA = 2 * randsign() * Math.asin(sd / (2 * bR));
					cX = bX - bR * Math.cos(bA);
					cY = bY - bR * Math.sin(bA);
					thisPrevObj = obj;
					if(isOutside(bX,bY))
					{
						acF = false;
					}
					for(j=i+1;j<hitObjectArray.length;j++)
					{
						if(!acF)
						{
							break;
						}
						thisObj = hitObjectArray[j];
						if(divisorBetween(thisObj,thisPrevObj) > 1/3)
						{
							break;
						}
						else if(isOutside(cX + bR * Math.cos(bA + (j-i) * eA),cY + bR * Math.sin(bA + (j-i) * eA)))
						{
							acF = false;
							break;
						}
						thisPrevObj = thisObj;
					}
					if(CYC == 0)
					{
						alert(bX+","+bY+","+cX+","+cY+","+bA+","+eA);
						throw new Error("stop plz");
						break;
					}
				}
				while(!acF);
				eN = 0;
				obj.x = Math.round(bX);
				obj.y = Math.round(bY);
				prevX = obj.x;
				prevY = obj.y;
			}
			else
			{
				eN++;
				obj.x = Math.round(cX + bR * Math.cos(bA + eN * eA));
				obj.y = Math.round(cY + bR * Math.sin(bA + eN * eA));
				prevX = obj.x;
				prevY = obj.y;
			}
		}
	}
	generalData = generalData.replace(/m\x6fde: ?[0-9]/i,"Mode: 0");
	output("breakmap3 complete!")
	diffname_buff("bm3");
	br_close();
}

function breakmap5()
{
	if(hitObjectArray.length <= 1) { output("No object!"); return 0; }
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	var minDist = 75;
	var maxDist = 0;
	var maxDistG = [0,0,0];
	var minRadius = 120;
	var maxRadius = 240;
	var cX = hitObjectArray[0].x;
	var cY = hitObjectArray[0].y;
	var bX = 0;
	var bY = 0;
	var bA = 0;
	var bR = 0;
	var eA = 0;
	var sd = 0;
	var rd = 0;
	var dd = 0;
	var eN = 0;
	var minSD = 999;
	var maxSD = 1;
	var minRD = 999;
	var maxRD = 1;
	var acF = 0;
	var j = 0;
	var thisObj = null;
	var thisPrevObj = null;
	var prevX = hitObjectArray[0].x;
	var prevY = hitObjectArray[0].y;
	for(var i=1;i<hitObjectArray.length;i++)
	{
		var obj = hitObjectArray[i];
		var prevObj = hitObjectArray[i-1];
		if((obj.type & 1) && divisorBetween(obj,prevObj) < 0.3 && divisorBetween(obj,prevObj) > 0.15) // 1/4 and 1/6 circles
		{
			sd = distance(obj.x, obj.y, prevObj.x, prevObj.y);
			minSD = Math.min(sd, minSD);
			maxSD = Math.max(sd, maxSD);
		}
		else if(prevObj.type & 2 && divisorBetween2(obj,prevObj) < 0.3)
		{
			var rz = getSliderEnd(prevObj);
			rd = distance(obj.x, obj.y, rz[0], rz[1]);
			minRD = Math.min(rd, minRD);
			maxRD = Math.max(rd, maxRD);
		}
		else if(divisorBetween(obj,prevObj) < 0.6)
		{
			dd = distance(obj.x, obj.y, prevObj.x, prevObj.y);
			if(dd > maxDistG[0] && dd > maxDistG[1] && dd > maxDistG[2])
			{
				maxDistG.shift();
				maxDistG.push(dd);
			}
		}
	}
	maxDist = maxDistG[0] * 1.3;
	if(minDist > maxDist)
	{
		maxDist /= 1.2;
		maxDist = Math.max(maxDist, 75);
		minDist = maxDist - 15;
	}
	if(maxSD - minSD < 10 && maxSD < 15)
	{
		minSD = 30;
		maxSD = 40;
	}
	if(maxRD - minRD < 10 && maxRD < 20)
	{
		minRD = 30;
		maxRD = 70;
	}
	for(var i=1;i<hitObjectArray.length;i++)
	{
		var obj = hitObjectArray[i];
		if(obj.time >= dTimeStart && obj.time <= dTimeEnd)
		{
			var prevObj = hitObjectArray[i-1];
			var ox = parseInt(obj.x);
			var oy = parseInt(obj.y);
			if(obj.type & 8)
			{
				continue;
			}
			if(divisorBetween(obj,prevObj) > 1/3)
			{
				do
				{
					acF = true;
					if(prevObj.type & 2 && divisorBetween2(obj,prevObj) < 0.3)
					{
						var slF = true;
						var rz = getSliderEnd(prevObj);
						do
						{
							rd = randbetween(minRD,maxRD);
							bA = Math.random() * 2 * Math.PI;
							bX = rz[0] + rd * Math.cos(bA);
							bY = rz[1] + rd * Math.sin(bA);
						}
						while(isOutside(bX, bY));
						cX = randbetween(0 - minRadius,512 + minRadius);
						cY = randbetween(0 - minRadius,384 + minRadius);
						bA = Math.atan2(bY - cY, bX - cX);
						bR = randbetween(minRadius,maxRadius);
						sd = randbetween(minSD,maxSD);
						eA = 2 * randsign() * Math.asin(sd / (2 * bR));
						cX = bX - bR * Math.cos(bA);
						cY = bY - bR * Math.sin(bA);
					}
					else
					{
						var slF = false;
						cX = randbetween(0 - minRadius,512 + minRadius);
						cY = randbetween(0 - minRadius,384 + minRadius);
						bA = Math.random() * 2 * Math.PI;
						bR = randbetween(minRadius,maxRadius);
						sd = randbetween(minSD,maxSD);
						eA = 2 * randsign() * Math.asin(sd / (2 * bR));
						bX = cX + bR * Math.cos(bA);
						bY = cY + bR * Math.sin(bA);
					}
					thisPrevObj = obj;
					if((!slF && distance(bX,bY,prevX,prevY) < minDist) || isOutside(bX,bY))
					{
						acF = false;
					}
					else if(distance(bX,bY,prevX,prevY) > maxDist && divisorBetween2(obj,prevObj) < 0.6)
					{
						acF = false;
					}
					for(j=i+1;j<hitObjectArray.length;j++)
					{
						if(!acF)
						{
							break;
						}
						thisObj = hitObjectArray[j];
						if(divisorBetween(thisObj,thisPrevObj) > 1/3)
						{
							break;
						}
						else if(isOutside(cX + bR * Math.cos(bA + (j-i) * eA),cY + bR * Math.sin(bA + (j-i) * eA)))
						{
							acF = false;
							break;
						}
						thisPrevObj = thisObj;
					}
				}
				while(!acF);
				eN = 0;
				obj.x = Math.round(bX);
				obj.y = Math.round(bY);
				prevX = obj.x;
				prevY = obj.y;
			}
			else if((eN >= 8 && isWhiteLine(obj.time) && Math.random() < 1/2) || prevObj.type & 2)
			{
				eN++;
				bX = cX + bR * Math.cos(bA + eN * eA);
				bY = cY + bR * Math.sin(bA + eN * eA);
				var CYC = 222;
				do
				{
					--CYC;
					acF = true;
					bA = Math.random() * 2 * Math.PI;
					bR = randbetween(minRadius,maxRadius);
					sd = randbetween(minSD,maxSD);
					eA = 2 * randsign() * Math.asin(sd / (2 * bR));
					cX = bX - bR * Math.cos(bA);
					cY = bY - bR * Math.sin(bA);
					thisPrevObj = obj;
					if(isOutside(bX,bY))
					{
						acF = false;
					}
					for(j=i+1;j<hitObjectArray.length;j++)
					{
						if(!acF)
						{
							break;
						}
						thisObj = hitObjectArray[j];
						if(divisorBetween(thisObj,thisPrevObj) > 1/3)
						{
							break;
						}
						else if(isOutside(cX + bR * Math.cos(bA + (j-i) * eA),cY + bR * Math.sin(bA + (j-i) * eA)))
						{
							acF = false;
							break;
						}
						thisPrevObj = thisObj;
					}
					if(CYC == 0)
					{
						alert(bX+","+bY+","+cX+","+cY+","+bA+","+eA);
						throw new Error("stop plz");
						break;
					}
				}
				while(!acF);
				eN = 0;
				obj.x = Math.round(bX);
				obj.y = Math.round(bY);
				prevX = obj.x;
				prevY = obj.y;
			}
			else
			{
				eN++;
				obj.x = Math.round(cX + bR * Math.cos(bA + eN * eA));
				obj.y = Math.round(cY + bR * Math.sin(bA + eN * eA));
				prevX = obj.x;
				prevY = obj.y;
			}
			if(obj.type & 2)
			{
				var spX = [];
				var spY = [];
				for(var k=1;k<obj.sliderPoints.length;k++)
				{
					var spe = obj.sliderPoints[k].split(":");
					spX.push(parseInt(spe[0]) - ox);
					spY.push(parseInt(spe[1]) - oy);
				}
				if(Math.random() > 0.5)
				{
					for(var k=0;k<spX.length;k++)
					{
						spX[k] *= -1;
					}
				}
				var ltX = spX[spX.length-1];
				var ltY = spY[spY.length-1];
				var ag = 0;
				var cyc = 222;
				do
				{
					ag = Math.random() * 2 * Math.PI;
				}
				while(--cyc && isOutside(obj.x + Math.cos(ag) * ltX + Math.sin(ag) * ltY, obj.y - Math.sin(ag) * ltX + Math.cos(ag) * ltY));
				if(cyc == 0)
				{
					// alert(obj.time+","+ltX+","+ltY+","+obj.x+","+obj.y);
				}
				for(var k=0;k<spX.length;k++)
				{
					var tempX = spX[k];
					var tempY = spY[k];
					spX[k] = obj.x + Math.cos(ag) * tempX + Math.sin(ag) * tempY;
					spY[k] = obj.y - Math.sin(ag) * tempX + Math.cos(ag) * tempY;
				}
				var de = [];
				de.push(obj.sliderPoints[0]);
				for(var k=0;k<spX.length;k++)
				{
					de.push(Math.round(spX[k]) + ":" + Math.round(spY[k]));
				}
				obj.sliderPoints = de;
			}
		}
	}
	output("breakmap5 complete!")
	diffname_buff("RAN" + randbetween(1, 9999999));
	br_close();
}

function getSliderEnd(a)
{
	if(!(a.type & 2) || !a.sliderPoints || a.sliderReverses % 2 == 0)
	{
		return [a.x, a.y];
	}
	var t = a.sliderPoints[a.sliderPoints.length-1].split(":");
	return [parseInt(t[0]), parseInt(t[1])];
}

function breakmap2_nmX(z)
{
	return Math.max(0,Math.min(512,Math.floor(z * 192 + 256)));
}

function breakmap2_nmY(z)
{
	return Math.max(0,Math.min(384,Math.floor(-z * 192 + 192)));
}

function reflX(x)
{
	var xm = (x + 16/3) % (16/3);
	if(xm > 4/3 && xm < 12/3)
	{
		return 8/3-xm;
	}
	else if(xm>=12/3)
	{
		return xm-16/3;
	}
	else
	{
		return xm;
	}
}

function reflY(y)
{
	var m = (y + 4) % 4;
	if(m > 1 && m < 3)
	{
		return 2-m;
	}
	else if(m>=3)
	{
		return m-4;
	}
	else
	{
		return m;
	}
}

function breakmap2()
{
	if(hitObjectArray.length == 0) { output("No object!"); return 0; }
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	var x = 0;
	var y = 0;
	var t = 0;
	var minDist = 75;
	for(var i=0;i<hitObjectArray.length;i++)
	{
		var obj = hitObjectArray[i];
		if(obj.time >= dTimeStart && obj.time <= dTimeEnd)
		{
			eval($("float_breakmap_2_1").value);
			eval($("float_breakmap_2_2").value);
			obj.x = breakmap2_nmX(x);
			obj.y = breakmap2_nmY(y);
			t++;
		}
	}
	output("breakmap2 complete!")
	diffname_buff("bm2");
	br_close();
}

var maimaiS = {
	"bg"        : "maimai-touchpad.png",
	"ring"      : "maimai-ball.png",
	"ringGold"  : "maimai-ball-gold.png",
	"ringBonus" : "maimai-ball-bonus.png",
	"holdL"     : "maimai-hold-left.png",
	"holdR"     : "maimai-hold-right.png",
	"hold"      : "maimai-hold.png",
	"holdGoldL" : "maimai-hold-gold-left.png",
	"holdGoldR" : "maimai-hold-gold-right.png",
	"holdGold"  : "maimai-hold-gold.png",
	"star"      : "maimai-star.png",
	"starGold"  : "maimai-star-gold.png",
	"circle"    : "maimai-circle.png",
	"light"     : ["maimai-lighthane.png",
					   		 "maimai-light1.png",
					   		 "maimai-light2.png",
					   		 "maimai-light3.png",
					   		 "maimai-light4.png",
					   		 "maimai-light5.png",
					   		 "maimai-light6.png",
					   		 "maimai-light7.png",
					   		 "maimai-light8.png",
					   		 "maimai-lights.png"]
};
var maimaiD = {
	"scale"          : 0.25,
	"starScale"      : 0.35,
	"circleScaleIn"  : 0.25,
	"circleScaleOut" : 1,
	"circleExpand"   : 1.15,
	"circleX"        : 320,
	"circleY"        : 247,
	"holdWidth"      : 5
};

var maimaiSyncCircles = "";
var maimaiSyncObj = {};
var maimaiLights = "";

var m_beginPosX = [215, 238, 271, 294, 294, 271, 238, 215];
var m_beginPosY = [176, 152, 152, 174, 208, 231, 231, 208];
var m_hitPosX =   [ 93, 184, 317, 408, 410, 319, 185,  93];
var m_hitPosY =   [128,  34,  32, 122, 257, 348, 348, 257];
var m_arrowPosX = [116, 140, 364, 392, 392, 364, 140, 116];
var m_arrowPosY = [ 84,  60,  60,  84, 296, 324, 324, 296];
var m_arr2PosX =  [ 88, 232, 276, 420, 420, 276, 232,  88];
var m_arr2PosY =  [168,  24,  24, 168, 208, 356, 356, 208];

function getAngle(x1,y1,x2,y2)
{
	return Math.atan2((y1-y2),(x1-x2));
}

function mai001(time,pos,fiT)
{
	var addX = 64;
	var addY = 56;
	var scaleBase = maimaiD.scale;
	var prefadeTime = fiT/2;
	var fadeoutTime = fiT/4;
	var facing = (Math.atan2(m_hitPosY[pos] - m_beginPosY[pos], m_hitPosX[pos] - m_beginPosX[pos]) + Math.PI) % (2*Math.PI); // note should face the hitline
	var o = "Sprite,Foreground,Centre,\"" + maimaiS.ring + "\",320,240\r\n";
	// o += " C,0," + Math.round(time-fiT) + ",,255,255,128\r\n";
	o += " M,0," + Math.round(time-fiT) + "," + Math.round(time) + "," + (addX+m_beginPosX[pos]) + "," + (addY+m_beginPosY[pos]) + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "\r\n";
	// first part is scaleup
	// o += " F,0," + Math.round(time-fiT*3/2) + "," + Math.round(time-fiT) + ",0,1\r\n";
	o += " S,0," + Math.round(time-fiT-prefadeTime) + "," + Math.round(time-fiT) + ",0," + scaleBase + "\r\n";
	
	o += " R,0," + Math.round(time) + "," + Math.round(time) + "," + facing + "\r\n";
	o += " F,0," + Math.round(time-fiT) + "," + Math.round(time) + ",1\r\n";
	o += " F,0," + Math.round(time) + "," + Math.round(time+fadeoutTime) + ",1,0\r\n";
	
	return o;
}

function mai002(time1,time2,pos,fiT,isGold) // normal hold
{
	isGold = isGold || false;
	var addX = 64;
	var addY = 56;
	var scaleBase = maimaiD.scale;
	var prefadeTime = fiT/2;
	var fadeoutTime = fiT/4;
	var facing = (Math.atan2(m_hitPosY[pos] - m_beginPosY[pos], m_hitPosX[pos] - m_beginPosX[pos]) + Math.PI) % (2*Math.PI); // note should face the hitline
	
	// beginning of hold
	var o = "Sprite,Foreground,Centre,\"" + (isGold?maimaiS.holdGoldL:maimaiS.holdL) + "\",320,240\r\n";
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time1) + "," + (addX+m_beginPosX[pos]) + "," + (addY+m_beginPosY[pos]) + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "\r\n";
	o += " S,0," + Math.round(time1-fiT-prefadeTime) + "," + Math.round(time1-fiT) + ",0," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time1) + "," + Math.round(time1) + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time2) + ",1\r\n";
	o += " F,0," + Math.round(time2) + "," + Math.round(time2+fadeoutTime) + ",1,0\r\n";
	// end of hold
	   o += "Sprite,Foreground,Centre,\"" + (isGold?maimaiS.holdGoldR:maimaiS.holdR) + "\",320,240\r\n";
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time2-fiT) + "," + (addX+m_beginPosX[pos]) + "," + (addY+m_beginPosY[pos]) + "\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time2) + "," + (addX+m_beginPosX[pos]) + "," + (addY+m_beginPosY[pos]) + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "\r\n";
	o += " S,0," + Math.round(time1-fiT-prefadeTime) + "," + Math.round(time1-fiT) + ",0," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time1) + "," + Math.round(time1) + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time2) + ",1\r\n";
	o += " F,0," + Math.round(time2) + "," + Math.round(time2+fadeoutTime) + ",1,0\r\n";
	// hold bar; how to deal with this when fiT < time2-time1?
	var totalL = distance(m_beginPosX[pos],m_beginPosY[pos],m_hitPosX[pos],m_hitPosY[pos]);
	var holdL = totalL * (time2-time1) / fiT + 3;
	var gFactor = (time2-time1) / fiT / 2;
	var gInc = (maimaiD.holdWidth%2) ? gFactor / maimaiD.holdWidth : 0; // center selection bug..? mb i should use topleft ww
	var mid1X = Math.round(addX+m_beginPosX[pos]+(m_hitPosX[pos]-m_beginPosX[pos])*(gFactor + gInc));
	var mid1Y = Math.round(addY+m_beginPosY[pos]+(m_hitPosY[pos]-m_beginPosY[pos])*(gFactor + gInc));
	var mid2X = Math.round(addX+m_beginPosX[pos]+(m_hitPosX[pos]-m_beginPosX[pos])*(1-gFactor + gInc));
	var mid2Y = Math.round(addY+m_beginPosY[pos]+(m_hitPosY[pos]-m_beginPosY[pos])*(1-gFactor + gInc));
	var vFactor = holdL / maimaiD.holdWidth;
	   o += "Sprite,Foreground,Centre,\"" + (isGold?maimaiS.holdGold:maimaiS.hold) + "\",320,240\r\n";
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time2-fiT) + "," + (addX+m_beginPosX[pos]) + "," + (addY+m_beginPosY[pos]) + "," + mid1X + "," + mid1Y + "\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time1) + "," + mid1X + "," + mid1Y + "," + mid2X + "," + mid2Y + "\r\n";
	o += " M,0," + Math.round(time1) + "," + Math.round(time2) + "," + mid2X + "," + mid2Y + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "\r\n";
	o += " V,0," + Math.round(time1-fiT) + "," + Math.round(time2-fiT) + "," + 0 + "," + scaleBase + "," + vFactor + "," + scaleBase + "\r\n";
	o += " V,0," + Math.round(time2-fiT) + "," + Math.round(time1) + "," + vFactor + "," + scaleBase + "\r\n";
	o += " V,0," + Math.round(time1) + "," + Math.round(time2) + "," + vFactor + "," + scaleBase + "," + 0 + "," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time1) + "," + Math.round(time1) + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time2) + ",1\r\n";
	o += " F,0," + Math.round(time2) + "," + Math.round(time2+fadeoutTime) + ",1,0\r\n";
	
	// begin time1-fiT time1 begin-end
	// end   time2-fiT time2 begin-end
	// time2-fiT -> time1 normal speed, v=(end-begin)/fiT
	// time1-fiT -> time2-fiT half speed, v=(end-begin)/2fiT, vscale up
	// time1 -> time2 half speed, v=(end-begin)/2fiT, vscale down
	return o;
}

function mai003(time,timeEnd,pos,fiT,ex,ey,tp,isGold) // star for the drag-slider
{
	isGold = isGold || false;
	var addX = 64;
	var addY = 56;
	var scaleBase = maimaiD.starScale;
	var prefadeTime = fiT/2;
	var fadeoutTime = fiT/4;
	var facing = (Math.atan2(m_hitPosY[pos] - m_beginPosY[pos], m_hitPosX[pos] - m_beginPosX[pos]) + Math.PI/2) % (2*Math.PI);
	var o = "Sprite,Foreground,Centre,\"" + (isGold?maimaiS.starGold:maimaiS.star) + "\",320,240\r\n";
	o += " M,0," + Math.round(time-fiT) + "," + Math.round(time) + "," + (addX+m_beginPosX[pos]) + "," + (addY+m_beginPosY[pos]) + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "\r\n";
	if(tp == 0)
	{
		o += " M,0," + Math.round(time) + "," + Math.round((time+timeEnd)/2) + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "\r\n";
		o += " M,0," + Math.round((time+timeEnd)/2) + "," + Math.round(timeEnd) + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "," + parseInt(addX+ex,10) + "," + parseInt(addY+ey,10) + "\r\n";
	}
	else
	{
		o += " M,0," + Math.round(time) + "," + Math.round(timeEnd) + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "," + parseInt(addX+ex,10) + "," + parseInt(addY+ey,10) + "\r\n";
	}
	o += " S,0," + Math.round(time-fiT-prefadeTime) + "," + Math.round(time-fiT) + ",0," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time) + "," + Math.round(time) + "," + facing + "\r\n";
	o += " F,0," + Math.round(time-fiT) + "," + Math.round(time) + ",1\r\n";
	o += " F,0," + Math.round(timeEnd) + "," + Math.round(timeEnd+fadeoutTime) + ",1,0\r\n";
	return o;
}

function mai004(time,pos,fiT) // gold note (simult)
{
	var addX = 64;
	var addY = 56;
	var scaleBase = maimaiD.scale;
	var prefadeTime = fiT/2;
	var fadeoutTime = fiT/4;
	var facing = 0;
	var o = "Sprite,Foreground,Centre,\"" + maimaiS.ringGold + "\",320,240\r\n";
	o += " M,0," + Math.round(time-fiT) + "," + Math.round(time) + "," + (addX+m_beginPosX[pos]) + "," + (addY+m_beginPosY[pos]) + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "\r\n";
	o += " S,0," + Math.round(time-fiT-prefadeTime) + "," + Math.round(time-fiT) + ",0," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time) + "," + Math.round(time) + "," + facing + "\r\n";
	o += " F,0," + Math.round(time-fiT) + "," + Math.round(time) + ",1\r\n";
	o += " F,0," + Math.round(time) + "," + Math.round(time+fadeoutTime) + ",1,0\r\n";
	if(!maimaiSyncObj[time])
	{
		maimaiSyncObj[time] = true;
		var sc = "Sprite,Foreground,Centre,\"" + maimaiS.circle + "\",320,240\r\n";
		sc += " C,0," + Math.round(time) + "," + Math.round(time) + ",255,232,137\r\n";
		sc += " M,0," + Math.round(time) + "," + Math.round(time) + "," + maimaiD.circleX + "," + maimaiD.circleY + "\r\n";
		sc += " S,0," + Math.round(time-fiT) + "," + Math.round(time) + "," + maimaiD.circleScaleIn + "," + maimaiD.circleScaleOut + "\r\n";
		sc += " F,0," + Math.round(time-fiT-prefadeTime) + "," + Math.round(time-fiT) + ",0,1\r\n";
		maimaiSyncCircles += sc;
	}
	return o;
}

function mai005(time1,time2,pos,fiT,isGold) // long hold
{
	isGold = isGold || false;
	var addX = 64;
	var addY = 56;
	var scaleBase = maimaiD.scale;
	var prefadeTime = fiT/2;
	var fadeoutTime = fiT/4;
	var facing = (Math.atan2(m_hitPosY[pos] - m_beginPosY[pos], m_hitPosX[pos] - m_beginPosX[pos]) + Math.PI) % (2*Math.PI); // note should face the hitline
	
	// beginning of hold
	var o = "Sprite,Foreground,Centre,\"" + (isGold?maimaiS.holdGoldL:maimaiS.holdL) + "\",320,240\r\n";
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time1) + "," + (addX+m_beginPosX[pos]) + "," + (addY+m_beginPosY[pos]) + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "\r\n";
	o += " S,0," + Math.round(time1-fiT-prefadeTime) + "," + Math.round(time1-fiT) + ",0," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time1) + "," + Math.round(time1) + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time2) + ",1\r\n";
	o += " F,0," + Math.round(time2) + "," + Math.round(time2+fadeoutTime) + ",1,0\r\n";
	// end of hold
	   o += "Sprite,Foreground,Centre,\"" + (isGold?maimaiS.holdGoldR:maimaiS.holdR) + "\",320,240\r\n";
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time2-fiT) + "," + (addX+m_beginPosX[pos]) + "," + (addY+m_beginPosY[pos]) + "\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time2) + "," + (addX+m_beginPosX[pos]) + "," + (addY+m_beginPosY[pos]) + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "\r\n";
	o += " S,0," + Math.round(time1-fiT-prefadeTime) + "," + Math.round(time1-fiT) + ",0," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time1) + "," + Math.round(time1) + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time2) + ",1\r\n";
	o += " F,0," + Math.round(time2) + "," + Math.round(time2+fadeoutTime) + ",1,0\r\n";
	// hold bar; fiT <= time2-time1?
	var totalL = distance(m_beginPosX[pos],m_beginPosY[pos],m_hitPosX[pos],m_hitPosY[pos]);
	var holdL = totalL + 3;
	var gFactor = 1/2;
	var gInc = (maimaiD.holdWidth%2) ? gFactor / maimaiD.holdWidth : 0; // center selection bug..? mb i should use topleft ww
	var mid1X = Math.round(addX+m_beginPosX[pos]+(m_hitPosX[pos]-m_beginPosX[pos])*(gFactor + gInc));
	var mid1Y = Math.round(addY+m_beginPosY[pos]+(m_hitPosY[pos]-m_beginPosY[pos])*(gFactor + gInc));
	var mid2X = Math.round(addX+m_beginPosX[pos]+(m_hitPosX[pos]-m_beginPosX[pos])*(1-gFactor + gInc));
	var mid2Y = Math.round(addY+m_beginPosY[pos]+(m_hitPosY[pos]-m_beginPosY[pos])*(1-gFactor + gInc));
	var vFactor = holdL / maimaiD.holdWidth;
	   o += "Sprite,Foreground,Centre,\"" + (isGold?maimaiS.holdGold:maimaiS.hold) + "\",320,240\r\n";
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time1) + "," + (addX+m_beginPosX[pos]) + "," + (addY+m_beginPosY[pos]) + "," + mid1X + "," + mid1Y + "\r\n";
	o += " M,0," + Math.round(time1) + "," + Math.round(time2-fiT) + "," + mid1X + "," + mid1Y + "," + mid2X + "," + mid2Y + "\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time2) + "," + mid2X + "," + mid2Y + "," + (addX+m_hitPosX[pos]) + "," + (addY+m_hitPosY[pos]) + "\r\n";
	o += " V,0," + Math.round(time1-fiT) + "," + Math.round(time1) + "," + 0 + "," + scaleBase + "," + vFactor + "," + scaleBase + "\r\n";
	o += " V,0," + Math.round(time1) + "," + Math.round(time2-fiT) + "," + vFactor + "," + scaleBase + "\r\n";
	o += " V,0," + Math.round(time2-fiT) + "," + Math.round(time2) + "," + vFactor + "," + scaleBase + "," + 0 + "," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time1) + "," + Math.round(time1) + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time2) + ",1\r\n";
	o += " F,0," + Math.round(time2) + "," + Math.round(time2+fadeoutTime) + ",1,0\r\n";
	
	// begin time1-fiT time1 begin-end
	// end   time2-fiT time2 begin-end
	// time2-fiT -> time1 normal speed, v=(end-begin)/fiT
	// time1-fiT -> time2-fiT half speed, v=(end-begin)/2fiT, vscale up
	// time1 -> time2 half speed, v=(end-begin)/2fiT, vscale down
	return o;
}

var maimaiL = {
	"F" : function(n,t,l,f,c) { // flash: lightN, timeBegin, timeLength, fadeoutLength, color[r,g,b]
		c = c || [255,55,55]; // default to a red color
		maimaiLights += "Sprite,Foreground,Centre,\"" + maimaiS.light[n] + "\",320,240\r\n";
		maimaiLights += " M,0," + t + "," + t + "," + maimaiD.circleX + "," + maimaiD.circleY + "\r\n";
		maimaiLights += " F,0," + t + "," + (t+l) + ",1\r\n";
		maimaiLights += " F,0," + (t+l) + "," + (t+l+f) + ",1,0\r\n";
		maimaiLights += " C,0," + t + "," + (t+l+f) + "," + c.join(",") + "\r\n";
	},
	"T" : function(n,ca) { // colorturn: lightN, ca[[timePoint,r,g,b], timePoint,r,g,b], ...]
		maimaiLights += "Sprite,Foreground,Centre,\"" + maimaiS.light[n] + "\",320,240\r\n";
		maimaiLights += " M,0," + t + "," + t + "," + maimaiD.circleX + "," + maimaiD.circleY + "\r\n";
		for(var i=1;i<ca.length;i++)
		{
			maimaiLights += " C,0," + ca[i-1][0] + "," + ca[i][0] + "," + ca[i-1][1] + "," + ca[i-1][2] + "," + ca[i-1][3]
																														+ "," + ca[i][1] + "," + ca[i][2] + "," + ca[i][3] + "\r\n";
		}
		maimaiLights += " F,0," + ca[i-1][0] + "," + ca[i][0] + ",1,0\r\n";
	},
	"A" : function(n,ca) { // colorturn2: lightN, ca[[timePoint,r,g,b,a], timePoint,r,g,b,a], ...]
		maimaiLights += "Sprite,Foreground,Centre,\"" + maimaiS.light[n] + "\",320,240\r\n";
		maimaiLights += " M,0," + t + "," + t + "," + maimaiD.circleX + "," + maimaiD.circleY + "\r\n";
		for(var i=1;i<ca.length;i++)
		{
			maimaiLights += " C,0," + ca[i-1][0] + "," + ca[i][0] + "," + ca[i-1][1] + "," + ca[i-1][2] + "," + ca[i-1][3]
																														+ "," + ca[i][1] + "," + ca[i][2] + "," + ca[i][3] + "\r\n";
			maimaiLights += " F,0," + ca[i-1][0] + "," + ca[i][0] + "," + ca[i-1][4] + "," + ca[i][4] + "\r\n";
		}
	},
	"O" : function(t,l,c) { // hitline expansion
		c = c || [255,55,55];
		maimaiLights += "Sprite,Foreground,Centre,\"" + maimaiS.circle + "\",320,240\r\n";
		maimaiLights += " M,0," + t + "," + t + "," + maimaiD.circleX + "," + maimaiD.circleY + "\r\n";
		maimaiLights += " S,0," + t + "," + (t+l) + "," + maimaiD.circleScaleOut + "," + maimaiD.circleExpand + "\r\n";
		maimaiLights += " F,0," + t + "," + (t+l) + ",1,0\r\n";
		maimaiLights += " C,0," + t + "," + (t+l) + "," + c.join(",") + "\r\n";
	},
	"RCn" : -1,
	"RC" : function() { // random lightcolor
		var arrA = [0,1,2,3];
		var arrC = [[175,255,255],[250,107,225],[136,172,255],[240,255,112]];
		if(maimaiL.RCn > -1)
		{
			arrA.splice(maimaiL.RCn,1);
		}
		maimaiL.RCn = arrA[Math.floor(Math.random()*arrA.length)];
		return arrC[maimaiL.RCn];
	},
	"RCr" : function() {
		maimaiL.RCn = -1;
	}
};

function maimai()
{
	var sData = "";
	var o = "";
	var maxDist = 20;
	var fadeInTime = 750;
	if(hitObjectArray.length == 0) { output("No object!"); return 0; }
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	
	maimaiSyncCircles = "";
	maimaiSyncObj = {}; // array to put in beginTime, to ensure 1 synccircle one time
	maimaiLights = "";
	
	for(var i=0;i<hitObjectArray.length;i++)
	{
		var obj = hitObjectArray[i];
		if(obj.time >= dTimeStart && obj.time <= dTimeEnd)
		{
			if(obj.type & 1)
			{
				if((hitObjectArray[i-1] && hitObjectArray[i-1].time == obj.time)
				|| (hitObjectArray[i+1] && hitObjectArray[i+1].time == obj.time)) // multitouch
				{
					for(var k=0;k<m_hitPosX.length;k++)
					{
						if(distance(obj.x,obj.y,m_hitPosX[k],m_hitPosY[k]) < maxDist)
						{
							sData += mai004(obj.time,k,fadeInTime);
							obj.x = m_hitPosX[k];
							obj.y = m_hitPosY[k];
							break;
						}
					}
				}
				else
				{
					for(var k=0;k<m_hitPosX.length;k++)
					{
						if(distance(obj.x,obj.y,m_hitPosX[k],m_hitPosY[k]) < maxDist)
						{
							sData += mai001(obj.time,k,fadeInTime);
							obj.x = m_hitPosX[k];
							obj.y = m_hitPosY[k];
							break;
						}
					}
				}
			}
			else if(obj.type & 2)
			{
				if((obj.hitsounds & 2) == 0) // hitsound whistle -> drag slider (+clap -> non-stop drag)
				{
					var endPos = obj.sliderPoints[obj.sliderPoints.length-1].split(":");
					var endX = parseInt(endPos[0],10);
					var endY = parseInt(endPos[1],10);
					for(var k=0;k<m_hitPosX.length;k++)
					{
						if(distance(obj.x,obj.y,m_hitPosX[k],m_hitPosY[k]) < maxDist)
						{
							break;
						}
					}
					// get the endpoint tick
					var ticks = obj.sliderLength / getSliderLen(obj.time);
					var tickLength = getTickLen(obj.time);
					var endTick = Math.round(obj.time + ticks * tickLength);
					var ig = (hitObjectArray[i-1] && hitObjectArray[i-1].time == obj.time) || (hitObjectArray[i+1] && hitObjectArray[i+1].time == obj.time);
					
					// make an hold object
					if(endTick - obj.time < fadeInTime)
					{
						sData += mai002(obj.time,endTick,k,fadeInTime,ig);
					}
					else
					{
						sData += mai005(obj.time,endTick,k,fadeInTime,ig);
					}
					
					// realign the slider
					obj.x = m_hitPosX[k];
					obj.y = m_hitPosY[k];
					obj.sliderPoints = ["B"];
					for(var k3=0;k3<obj.sliderLength / 2;k3++)
					{
						obj.sliderPoints.push((m_hitPosX[k]+1) + ":" + m_hitPosY[k]);
						obj.sliderPoints.push((m_hitPosX[k]+1) + ":" + m_hitPosY[k]);
						obj.sliderPoints.push(m_hitPosX[k] + ":" + m_hitPosY[k]);
						obj.sliderPoints.push(m_hitPosX[k] + ":" + m_hitPosY[k]);
					}                       
				}
				else
				{
					var endPos = obj.sliderPoints[obj.sliderPoints.length-1].split(":");
					var endX = parseInt(endPos[0],10);
					var endY = parseInt(endPos[1],10);
					for(var k=0;k<m_hitPosX.length;k++)
					{
						if(distance(obj.x,obj.y,m_hitPosX[k],m_hitPosY[k]) < maxDist)
						{
							break;
						}
					}
					
					var ticks = obj.sliderLength / getSliderLen(obj.time);
					var tickLength = getTickLen(obj.time);
					var endTick = Math.round(obj.time + ticks * tickLength);
					var zzzz = obj.sliderPoints[obj.sliderPoints.length-1].split(":");
					var ig = (hitObjectArray[i-1] && hitObjectArray[i-1].time == obj.time) || (hitObjectArray[i+1] && hitObjectArray[i+1].time == obj.time);
					
					// make a star
					sData += mai003(obj.time,endTick,k,fadeInTime,parseInt(zzzz[0],10),parseInt(zzzz[1],10),obj.hitsounds & 8,ig);
					// realign the slider
					var dx = m_hitPosX[k] - obj.x;
					var dy = m_hitPosY[k] - obj.y;
					obj.x = m_hitPosX[k];
					obj.y = m_hitPosY[k];
					for(var k3=1;k3<obj.sliderPoints.length;k3++)
					{
						var cr = obj.sliderPoints[k3].split(":");
						var cx = parseInt(cr[0],10);
						var cy = parseInt(cr[1],10);
						obj.sliderPoints[k3] = (dx+cx) + ":" + (dy+cy);
					}
					obj.hitsounds = obj.hitsounds & 0xfffd;
				}
			}
		}
	}
	// realign the touchpad
	var evtArray = eventsData.split(/\r?\n/);
	for(var i=0;i<evtArray.length;i++)
	{
		if(evtArray[i].indexOf(maimaiS.bg) != -1)
		{
			for(var j=i+1;j<evtArray.length;j++)
			{
				if(evtArray[j].indexOf("M") == 1)
				{
					var evtC = evtArray[j].split(",");
					if(!evtC[5])
					{
						continue;
					}
					evtC[4] = "" + maimaiD.circleX;
					evtC[5] = "" + maimaiD.circleY;
					evtArray[j] = evtC.join(",");
				}
				else if(evtArray[j].charAt(0) != " " && evtArray[j].charAt(0) != "_")
				{
					break;
				}
			}
			break;
		}
	}
	
	// some code here
	maimaiL.F(9, 46019, 32160, 480, [55, 55, 55]);
	for(var i=0; i<4; i++)
	{
		maimaiL.F(0, 46019 + i * 480, 240, 240, [255 - 30*i, 185 + 15*i, 35]);
	}
	for(var i=0; i<14; i++)
	{
		maimaiL.F(0, 47939 + i * 960, 120, 720, maimaiL.RC());
	}
	maimaiL.F(0, 61139, 240, 480, [255, 75, 35]);
	for(var i=0; i<5; i++)
	{
		maimaiL.F(0, 61859 + i * 240, 120, 120, [255, 75, 35]);
	}
	for(var i=0; i<14; i++)
	{
		maimaiL.F(0, 63299 + i * 960, 120, 720, maimaiL.RC());
	}
	for(var i=0; i<2; i++)
	{
		maimaiL.F(0, 76739 + i * 480, 240, 240, [75, 255, 35]);
	}
	maimaiL.F(0, 77699, 480, 480, [175, 255, 35]);
	maimaiL.F(9, 94022, 30720, 480, [55, 55, 55]);
	for(var i=0; i<14; i++)
	{
		maimaiL.F(0, 94022 + i * 960, 120, 720, maimaiL.RC());
	}
	maimaiL.F(0, 107222, 240, 480, [255, 75, 35]);
	for(var i=0; i<5; i++)
	{
		maimaiL.F(0, 107942 + i * 240, 120, 120, [255, 75, 35]);
	}
	for(var i=0; i<14; i++)
	{
		maimaiL.F(0, 109382 + i * 960, 120, 720, maimaiL.RC());
	}
	for(var i=0; i<2; i++)
	{
		maimaiL.F(0, 122822 + i * 480, 240, 240, [75, 255, 35]);
	}
	maimaiL.F(0, 123782, 480, 480, [175, 255, 35]);
	
	// output to map
	eventsData = evtArray.join("\r\n") + "\r\n" + maimaiLights + maimaiSyncCircles + sData;
	generalData = generalData.replace(/StackLeniency: ?[0-9\.]*\r?\n/i, "StackLeniency: 0\r\n");
	output("bm_maimai complete!")
	diffname_buff("maimai");
	br_close();
}

var loveliveS = {
	"bg"        : "G\\punmanlon.png",
	"ring"      : "G\\smileP.png",
	"ringGold"  : "G\\smileM.png",
	"ringBonus" : "G\\smileS.png",
	"ringBonusG": "G\\smileX.png",
	"holdend"   : "G\\slidertail.png",
	"triangleL" : "G\\triangle.png",
	"triangleR" : "G\\triangle2.png",
	"square"    : "G\\square.png",
	"musicmark" : "G\\musicmark.png",
	"light"     : "G\\hitlights_128.png"
};
var loveliveD = {
	"fadeInTime"     : 750,
	"scale"          : 0.3430943,
	"circleScaleIn"  : 0.25,
	"circleScaleOut" : 1,
	"circleExpand"   : 1.15,
	"circleX"        : 320,
	"circleY"        : 272,
	"radius"         : 44,
	"triangleW"      : 32,
	"triangleH"      : 32,
	"squareW"        : 32,
	"squareH"        : 32
};

var ll_beginPosX = 256;
var ll_beginPosY = 91;
var ll_hitPosX =  [  3,  24,  78, 164, 256, 347, 433, 487, 509];
var ll_hitPosY =  [ 91, 182, 269, 322, 343, 322, 269, 182,  91];

var ll_hitlights = "";

function ll001(color,time,pos,fiT,isGold,isBonus)
{
	var addX = 64;
	var addY = 56;
	var scaleBase = loveliveD.scale;
	var prefadeTime = 0;
	var fadeoutTime = fiT/8;
	var endingX = Math.round(ll_hitPosX[pos] + (ll_hitPosX[pos] - ll_beginPosX) * (fadeoutTime / fiT));
	var endingY = Math.round(ll_hitPosY[pos] + (ll_hitPosY[pos] - ll_beginPosY) * (fadeoutTime / fiT));
	var facing = 0; // LL notes always face the same angle
	if(isGold)
	{
		if(isBonus)
		{
			var o = "Sprite,Foreground,Centre,\"" + loveliveS.ringBonusG + "\",320,240\r\n";
		}
		else
		{
			var o = "Sprite,Foreground,Centre,\"" + loveliveS.ringGold + "\",320,240\r\n";
		}
	}
	else
	{
		if(isBonus)
		{
			var o = "Sprite,Foreground,Centre,\"" + loveliveS.ringBonus + "\",320,240\r\n";
		}
		else
		{
			var o = "Sprite,Foreground,Centre,\"" + loveliveS.ring + "\",320,240\r\n"; // split into colors next
		}
	}
	// o += " C,0," + Math.round(time-fiT) + ",,255,255,128\r\n";
	o += " M,0," + Math.round(time-fiT) + "," + Math.round(time) + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+ll_hitPosX[pos]) + "," + (addY+ll_hitPosY[pos]) + "\r\n";
//	o += " M,0," + Math.round(time) + "," + Math.round(time+fadeoutTime) + "," + (addX+ll_hitPosX[pos]) + "," + (addY+ll_hitPosY[pos]) + "," + (addX+endingX) + "," + (addY+endingY) + "\r\n";

	// o += " F,0," + Math.round(time-fiT*3/2) + "," + Math.round(time-fiT) + ",0,1\r\n";
	o += " S,0," + Math.round(time-fiT) + "," + Math.round(time) + ",0," + scaleBase + "\r\n";
//	o += " S,0," + Math.round(time) + "," + Math.round(time+fadeoutTime) + "," + scaleBase + "," + scaleBase*(1+fadeoutTime/fiT) + "\r\n";
	
	o += " R,0," + Math.round(time) + "," + Math.round(time) + "," + facing + "\r\n";
	o += " F,0," + Math.round(time-fiT) + "," + Math.round(time) + ",1\r\n";
//	o += " F,0," + Math.round(time) + "," + Math.round(time+fadeoutTime) + ",1,0\r\n";
	
	var lighttime = 300;
	var lightscale1 = 0.80;
	var lightscale2 = 1.20;
	var hl = "Sprite,Foreground,Centre,\"" + loveliveS.light + "\",320,240\r\n";
	hl += " M,0," + Math.round(time) + "," + Math.round(time+lighttime) + "," + (addX+ll_hitPosX[pos]) + "," + (addY+ll_hitPosY[pos]) + "\r\n";
	hl += " S,0," + Math.round(time) + "," + Math.round(time+lighttime) + "," + lightscale1 + "," + lightscale2 + "\r\n";
	hl += " R,0," + Math.round(time) + "," + Math.round(time) + "," + "0" + "\r\n";
	hl += " F,0," + Math.round(time) + "," + Math.round(time+lighttime) + ",1,0\r\n";
	ll_hitlights += hl;
	
	return o;
}

function ll002(color,time1,time2,pos,fiT,isGold,isBonus) // short hold
{
	var addX = 64;
	var addY = 56;
	var scaleBase = loveliveD.scale;
	var r = loveliveD.radius;
	var l = distance(ll_hitPosX[pos],ll_hitPosY[pos],ll_beginPosX,ll_beginPosY);
	var p1 = (time2-time1)/fiT;
	var p2 = (time1-time2+fiT)/fiT;
	var p3 = 1-p2;
	var fw = r * Math.sqrt(l*l - r*r) / l;
	var fh = l - r*r/l;
	var sw = fw / loveliveD.triangleW;
	var sh = fh / loveliveD.triangleH;
	if(pos == 1 || pos == 5)
	{
		var sw2 = (fw+1) / loveliveD.triangleW;
	}
	else if(pos == 6)
	{
		var sw2 = fw / loveliveD.triangleW;
	}
	else
	{
		var sw2 = fw / loveliveD.triangleW;
	}
	var vectX = ll_hitPosX[pos] - ll_beginPosX;
	var vectY = ll_hitPosY[pos] - ll_beginPosY;
	var cos_t = Math.sqrt(l*l - r*r) / l;
	var sin_t = r / l;
	var v2X = (cos_t * vectX - sin_t * vectY) * cos_t;
	var v2Y = (sin_t * vectX + cos_t * vectY) * cos_t;
	var x3 = Math.round(ll_beginPosX + v2X);
	var y3 = Math.round(ll_beginPosY + v2Y);
	var x2 = Math.round(ll_beginPosX + p2 * v2X);
	var y2 = Math.round(ll_beginPosY + p2 * v2Y);
	var v4X = (cos_t * vectX + sin_t * vectY) * cos_t;
	var v4Y = (-sin_t * vectX + cos_t * vectY) * cos_t;
	var x5 = Math.round(ll_beginPosX + v4X);
	var y5 = Math.round(ll_beginPosY + v4Y);
	var x4 = Math.round(ll_beginPosX + p2 * v4X);
	var y4 = Math.round(ll_beginPosY + p2 * v4Y);
	var prefadeTime = 0;
	var fadeoutTime = fiT/8;
	var endingX = Math.round(ll_hitPosX[pos] + (ll_hitPosX[pos] - ll_beginPosX) * (fadeoutTime / fiT));
	var endingY = Math.round(ll_hitPosY[pos] + (ll_hitPosY[pos] - ll_beginPosY) * (fadeoutTime / fiT));
	// only for triangle/square
	var facing = (Math.atan2(ll_hitPosY[pos] - ll_beginPosY, ll_hitPosX[pos] - ll_beginPosX) + 3*Math.PI/2) % (2*Math.PI); // note should face the hitline
	var o = "Sprite,Foreground,TopRight,\"" + loveliveS.triangleL + "\",320,240\r\n";
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time2-fiT)         + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time1)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+x2) + "," + (addY+y2) + "\r\n";
	o += " M,0," + Math.round(time1)     + "," + Math.round(time2)             + "," + (addX+x2) + "," + (addY+y2) + "," + (addX+x3) + "," + (addY+y3) + "\r\n";
	o += " V,0," + Math.round(time1-fiT) + "," + Math.round(time2-fiT)         + "," + "0,0," + p1*sw + "," + p1*sh + "\r\n";
	o += " V,0," + Math.round(time2-fiT) + "," + Math.round(time1)             + "," + p1*sw + "," + p1*sh + "," + p3*sw + "," + p3*sh + "\r\n";
	o += " V,0," + Math.round(time1)     + "," + Math.round(time2)             + "," + p3*sw + "," + p3*sh + "," + "0,0" + "\r\n";
	o += " R,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + ",1\r\n";
	o += " C,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",255,255,255\r\n";
	o += " C,0," + Math.round(time1)     + "," + Math.round(time2)             + ",255,255,200\r\n";
	o += "Sprite,Foreground,TopLeft,\"" + loveliveS.triangleR + "\",320,240\r\n";
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time2-fiT)         + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time1)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+x4) + "," + (addY+y4) + "\r\n";
	o += " M,0," + Math.round(time1)     + "," + Math.round(time2)             + "," + (addX+x4) + "," + (addY+y4) + "," + (addX+x5) + "," + (addY+y5) + "\r\n";
	o += " V,0," + Math.round(time1-fiT) + "," + Math.round(time2-fiT)         + "," + "0,0," + p1*sw2 + "," + p1*sh + "\r\n";
	o += " V,0," + Math.round(time2-fiT) + "," + Math.round(time1)             + "," + p1*sw2 + "," + p1*sh + "," + p3*sw + "," + p3*sh + "\r\n";
	o += " V,0," + Math.round(time1)     + "," + Math.round(time2)             + "," + p3*sw + "," + p3*sh + "," + "0,0" + "\r\n";
	o += " R,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + ",1\r\n";
	o += " C,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",255,255,255\r\n";
	o += " C,0," + Math.round(time1)     + "," + Math.round(time2)             + ",255,255,200\r\n";
	o += "Sprite,Foreground,TopLeft,\"" + loveliveS.square + "\",320,240\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time1)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+x2) + "," + (addY+y2) + "\r\n";
	o += " M,0," + Math.round(time1)     + "," + Math.round(time2)             + "," + (addX+x2) + "," + (addY+y2) + "," + (addX+x3) + "," + (addY+y3) + "\r\n";
	o += " V,0," + Math.round(time2-fiT) + "," + Math.round(time1)             + "," + "0," + p1*sh + "," + p2*sw2 + "," + p3*sh + "\r\n";
	o += " V,0," + Math.round(time1)     + "," + Math.round(time2)             + "," + p2*sw2 + "," + p3*sh + "," + sw + ",0" + "\r\n";
	o += " R,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + ",1\r\n";
	o += " C,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",255,255,255\r\n";
	o += " C,0," + Math.round(time1)     + "," + Math.round(time2)             + ",255,255,200\r\n";
	o += "Sprite,Foreground,TopRight,\"" + loveliveS.square + "\",320,240\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time1)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+x4) + "," + (addY+y4) + "\r\n";
	o += " M,0," + Math.round(time1)     + "," + Math.round(time2)             + "," + (addX+x4) + "," + (addY+y4) + "," + (addX+x5) + "," + (addY+y5) + "\r\n";
	o += " V,0," + Math.round(time2-fiT) + "," + Math.round(time1)             + "," + "0," + p1*sh + "," + p2*sw + "," + p3*sh + "\r\n";
	o += " V,0," + Math.round(time1)     + "," + Math.round(time2)             + "," + p2*sw + "," + p3*sh + "," + sw + ",0" + "\r\n";
	o += " R,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + ",1\r\n";
	o += " C,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",255,255,255\r\n";
	o += " C,0," + Math.round(time1)     + "," + Math.round(time2)             + ",255,255,200\r\n";
	o += "Sprite,Foreground,Centre,\"" + loveliveS.holdend + "\",320,240\r\n"; // split into colors next
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+ll_hitPosX[pos]) + "," + (addY+ll_hitPosY[pos]) + "\r\n";
//	o += " M,0," + Math.round(time2)     + "," + Math.round(time2+fadeoutTime) + "," + (addX+ll_hitPosX[pos]) + "," + (addY+ll_hitPosY[pos]) + "," + (addX+endingX) + "," + (addY+endingY) + "\r\n";
	o += " S,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + ",0," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time2)     + "," + Math.round(time2)             + "," + "0" + "\r\n";
	o += " F,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + ",1\r\n";
//	o += " F,0," + Math.round(time2)     + "," + Math.round(time2+fadeoutTime) + ",1,0\r\n";
	if(isGold)
	{
		o += "Sprite,Foreground,Centre,\"" + loveliveS.ringGold + "\",320,240\r\n";
	}
	else
	{
		o += "Sprite,Foreground,Centre,\"" + loveliveS.ring + "\",320,240\r\n";
	}
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+ll_hitPosX[pos]) + "," + (addY+ll_hitPosY[pos]) + "\r\n";
	o += " S,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",0," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time1)     + "," + Math.round(time1)             + "," + "0" + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",1\r\n";
	o += " F,0," + Math.round(time1)     + "," + Math.round(time2)             + ",1\r\n";
	o += " F,0," + Math.round(time2)     + "," + Math.round(time2)             + ",0\r\n";
	
	var lighttime = 300;
	var lightscale1 = 0.80;
	var lightscale2 = 1.20;
	var hl = "Sprite,Foreground,Centre,\"" + loveliveS.light + "\",320,240\r\n";
	hl += " M,0," + Math.round(time2) + "," + Math.round(time2+lighttime) + "," + (addX+ll_hitPosX[pos]) + "," + (addY+ll_hitPosY[pos]) + "\r\n";
	hl += " S,0," + Math.round(time2) + "," + Math.round(time2+lighttime) + "," + lightscale1 + "," + lightscale2 + "\r\n";
	hl += " R,0," + Math.round(time2) + "," + Math.round(time2) + "," + "0" + "\r\n";
	hl += " F,0," + Math.round(time2) + "," + Math.round(time2+lighttime) + ",1,0\r\n";
	ll_hitlights += hl;
	
	return o;
}

function ll005(color,time1,time2,pos,fiT,isGold) // long hold
{
	var addX = 64;
	var addY = 56;
	var scaleBase = loveliveD.scale;
	var r = loveliveD.radius;
	var l = distance(ll_hitPosX[pos],ll_hitPosY[pos],ll_beginPosX,ll_beginPosY);
	var p1 = (time2-time1)/fiT;
	var p2 = (time1-time2+fiT)/fiT;
	var p3 = 1-p2;
	var fw = r * Math.sqrt(l*l - r*r) / l;
	var fh = l - r*r/l;
	var sw = fw / loveliveD.triangleW;
	var sh = fh / loveliveD.triangleH;
	if(pos == 1 || pos == 5)
	{
		var sw2 = (fw+1) / loveliveD.triangleW;
	}
	else if(pos == 6)
	{
		var sw2 = (fw+0) / loveliveD.triangleW;
	}
	else
	{
		var sw2 = fw / loveliveD.triangleW;
	}
	var vectX = ll_hitPosX[pos] - ll_beginPosX;
	var vectY = ll_hitPosY[pos] - ll_beginPosY;
	var cos_t = Math.sqrt(l*l - r*r) / l;
	var sin_t = r / l;
	var v2X = (cos_t * vectX - sin_t * vectY) * cos_t;
	var v2Y = (sin_t * vectX + cos_t * vectY) * cos_t;
	var x3 = Math.round(ll_beginPosX + v2X);
	var y3 = Math.round(ll_beginPosY + v2Y);
	var x2 = Math.round(ll_beginPosX + p2 * v2X);
	var y2 = Math.round(ll_beginPosY + p2 * v2Y);
	var v4X = (cos_t * vectX + sin_t * vectY) * cos_t;
	var v4Y = (-sin_t * vectX + cos_t * vectY) * cos_t;
	var x5 = Math.round(ll_beginPosX + v4X);
	var y5 = Math.round(ll_beginPosY + v4Y);
	var x4 = Math.round(ll_beginPosX + p2 * v4X);
	var y4 = Math.round(ll_beginPosY + p2 * v4Y);
	var prefadeTime = 0;
	var fadeoutTime = fiT/8;
	var endingX = Math.round(ll_hitPosX[pos] + (ll_hitPosX[pos] - ll_beginPosX) * (fadeoutTime / fiT));
	var endingY = Math.round(ll_hitPosY[pos] + (ll_hitPosY[pos] - ll_beginPosY) * (fadeoutTime / fiT));
	// only for triangle/square
	var facing = (Math.atan2(ll_hitPosY[pos] - ll_beginPosY, ll_hitPosX[pos] - ll_beginPosX) + 3*Math.PI/2) % (2*Math.PI); // note should face the hitline
	var o = "Sprite,Foreground,TopRight,\"" + loveliveS.triangleL + "\",320,240\r\n";
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "\r\n";
	o += " M,0," + Math.round(time1)     + "," + Math.round(time2-fiT)         + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+x3) + "," + (addY+y3) + "\r\n";
	o += " V,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + "," + "0,0," + sw + "," + sh + "\r\n";
	o += " V,0," + Math.round(time1)     + "," + Math.round(time2-fiT)         + "," + sw + "," + sh + "\r\n";
	o += " V,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + "," + sw + "," + sh + "," + "0,0" + "\r\n";
	o += " R,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + ",1\r\n";
	o += " C,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",255,255,255\r\n";
	o += " C,0," + Math.round(time1)     + "," + Math.round(time2)             + ",255,255,200\r\n";
	o += "Sprite,Foreground,TopLeft,\"" + loveliveS.triangleR + "\",320,240\r\n";
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "\r\n";
	o += " M,0," + Math.round(time1)     + "," + Math.round(time2-fiT)         + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+x5) + "," + (addY+y5) + "\r\n";
	o += " V,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + "," + "0,0," + sw + "," + sh + "\r\n";
	o += " V,0," + Math.round(time1)     + "," + Math.round(time2-fiT)         + "," + sw + "," + sh + "\r\n";
	o += " V,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + "," + sw + "," + sh + "," + "0,0" + "\r\n";
	o += " R,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + ",1\r\n";
	o += " C,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",255,255,255\r\n";
	o += " C,0," + Math.round(time1)     + "," + Math.round(time2)             + ",255,255,200\r\n";
	o += "Sprite,Foreground,TopLeft,\"" + loveliveS.square + "\",320,240\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+x3) + "," + (addY+y3) + "\r\n";
	o += " V,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + "," + "0," + sh + "," + sw + "," + "0" + "\r\n";
	o += " R,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + ",1\r\n";
	o += " C,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",255,255,255\r\n";
	o += " C,0," + Math.round(time1)     + "," + Math.round(time2)             + ",255,255,200\r\n";
	o += "Sprite,Foreground,TopRight,\"" + loveliveS.square + "\",320,240\r\n";
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+x5) + "," + (addY+y5) + "\r\n";
	o += " V,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + "," + "0," + sh + "," + sw + "," + "0" + "\r\n";
	o += " R,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + "," + facing + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time1-fiT)         + ",1\r\n";
	o += " C,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",255,255,255\r\n";
	o += " C,0," + Math.round(time1)     + "," + Math.round(time2)             + ",255,255,200\r\n";
	o += "Sprite,Foreground,Centre,\"" + loveliveS.holdend + "\",320,240\r\n"; // split into colors next
	o += " M,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+ll_hitPosX[pos]) + "," + (addY+ll_hitPosY[pos]) + "\r\n";
//	o += " M,0," + Math.round(time2)     + "," + Math.round(time2+fadeoutTime) + "," + (addX+ll_hitPosX[pos]) + "," + (addY+ll_hitPosY[pos]) + "," + (addX+endingX) + "," + (addY+endingY) + "\r\n";
	o += " S,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + ",0," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time2)     + "," + Math.round(time2)             + "," + "0" + "\r\n";
	o += " F,0," + Math.round(time2-fiT) + "," + Math.round(time2)             + ",1\r\n";
//	o += " F,0," + Math.round(time2)     + "," + Math.round(time2+fadeoutTime) + ",1,0\r\n";
	if(isGold)
	{
		o += "Sprite,Foreground,Centre,\"" + loveliveS.ringGold + "\",320,240\r\n";
	}
	else
	{
		o += "Sprite,Foreground,Centre,\"" + loveliveS.ring + "\",320,240\r\n";
	}
	o += " M,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + "," + (addX+ll_beginPosX) + "," + (addY+ll_beginPosY) + "," + (addX+ll_hitPosX[pos]) + "," + (addY+ll_hitPosY[pos]) + "\r\n";
	o += " S,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",0," + scaleBase + "\r\n";
	o += " R,0," + Math.round(time1)     + "," + Math.round(time1)             + "," + "0" + "\r\n";
	o += " F,0," + Math.round(time1-fiT) + "," + Math.round(time1)             + ",1\r\n";
	o += " F,0," + Math.round(time1)     + "," + Math.round(time2)             + ",1\r\n";
	o += " F,0," + Math.round(time2)     + "," + Math.round(time2)             + ",0\r\n";
	
	var lighttime = 300;
	var lightscale1 = 0.80;
	var lightscale2 = 1.20;
	var hl = "Sprite,Foreground,Centre,\"" + loveliveS.light + "\",320,240\r\n";
	hl += " M,0," + Math.round(time2) + "," + Math.round(time2+lighttime) + "," + (addX+ll_hitPosX[pos]) + "," + (addY+ll_hitPosY[pos]) + "\r\n";
	hl += " S,0," + Math.round(time2) + "," + Math.round(time2+lighttime) + "," + lightscale1 + "," + lightscale2 + "\r\n";
	hl += " R,0," + Math.round(time2) + "," + Math.round(time2) + "," + "0" + "\r\n";
	hl += " F,0," + Math.round(time2) + "," + Math.round(time2+lighttime) + ",1,0\r\n";
	ll_hitlights += hl;
	
	return o;
}

function lovelive()
{
	var sData = "";
	var o = "";
	var maxDist = 20;
	var fadeInTime = loveliveD.fadeInTime;
	if(hitObjectArray.length == 0) { output("No object!"); return 0; }
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	
	ll_hitlights = "";
	
	for(var i=0;i<hitObjectArray.length;i++)
	{
		var obj = hitObjectArray[i];
		if(obj.time >= dTimeStart && obj.time <= dTimeEnd)
		{			
			if(obj.type & 1)
			{
				if((hitObjectArray[i-1] && hitObjectArray[i-1].time == obj.time)
				|| (hitObjectArray[i+1] && hitObjectArray[i+1].time == obj.time)) // multitouch
				{
					for(var k=0;k<ll_hitPosX.length;k++)
					{
						if(distance(obj.x,obj.y,ll_hitPosX[k],ll_hitPosY[k]) < maxDist)
						{
							sData += ll001(3,obj.time,k,fadeInTime,true,!!(obj.hitsounds&4));
							obj.x = ll_hitPosX[k];
							obj.y = ll_hitPosY[k];
							obj.hitsounds &= 0xfffb;
							break;
						}
					}
				}
				else
				{
					for(var k=0;k<ll_hitPosX.length;k++)
					{
						if(distance(obj.x,obj.y,ll_hitPosX[k],ll_hitPosY[k]) < maxDist)
						{
							sData += ll001(3,obj.time,k,fadeInTime,false,!!(obj.hitsounds&4));
							obj.x = ll_hitPosX[k];
							obj.y = ll_hitPosY[k];
							obj.hitsounds &= 0xfffb;
							break;
						}
					}
				}
			}
			else if(obj.type & 2)
			{
				var endPos = obj.sliderPoints[obj.sliderPoints.length-1].split(":");
				var endX = parseInt(endPos[0],10);
				var endY = parseInt(endPos[1],10);
				for(var k=0;k<ll_hitPosX.length;k++)
				{
					if(distance(obj.x,obj.y,ll_hitPosX[k],ll_hitPosY[k]) < maxDist)
					{
						break;
					}
				}
				// get the endpoint tick
				var ticks = obj.sliderLength / getSliderLen(obj.time);
				var tickLength = getTickLen(obj.time);
				var endTick = Math.round(obj.time + ticks * tickLength);
				var ig = (hitObjectArray[i-1] && hitObjectArray[i-1].time == obj.time) || (hitObjectArray[i+1] && hitObjectArray[i+1].time == obj.time);
				
				// make an hold object
				if(endTick - obj.time < fadeInTime)
				{
					sData += ll002(3,obj.time,endTick,k,fadeInTime,ig);
				}
				else
				{
					sData += ll005(3,obj.time,endTick,k,fadeInTime,ig);
				}
				
				// realign the slider
				obj.x = ll_hitPosX[k];
				obj.y = ll_hitPosY[k];
				obj.sliderPoints = ["B"];
				for(var k3=0;k3<obj.sliderLength / 2;k3++)
				{
					obj.sliderPoints.push((ll_hitPosX[k]+1) + ":" + ll_hitPosY[k]);
					obj.sliderPoints.push((ll_hitPosX[k]+1) + ":" + ll_hitPosY[k]);
					obj.sliderPoints.push(ll_hitPosX[k] + ":" + ll_hitPosY[k]);
					obj.sliderPoints.push(ll_hitPosX[k] + ":" + ll_hitPosY[k]);
				}
			}
		}
	}
	// realign the touchpad
	
	var touchpadEndTime = 0;
	
	var evtArray = eventsData.split(/\r?\n/);
	for(var i=0;i<evtArray.length;i++)
	{
		if(evtArray[i].indexOf(loveliveS.bg) != -1)
		{
			for(var j=i+1;j<evtArray.length;j++)
			{
				if(evtArray[j].indexOf("M") == 1)
				{
					var evtC = evtArray[j].split(",");
					if(!evtC[5])
					{
						continue;
					}
					evtC[4] = "" + loveliveD.circleX;
					evtC[5] = "" + loveliveD.circleY;
					evtArray[j] = evtC.join(",");
				}
				else if(evtArray[j].charAt(0) != " " && evtArray[j].charAt(0) != "_")
				{
					break;
				}
				else
				{
					var evtC = evtArray[j].split(",");
					if(!isNaN(parseInt(evtC[3], 10)))
					touchpadEndTime = Math.max(touchpadEndTime, parseInt(evtC[3], 10));
				}
			}
			break;
		}
	}
	
	var musicmark = "Sprite,Foreground,Centre,\"" + loveliveS.musicmark + "\",320,240\r\n";
	musicmark += " M,0," + 0 + "," + Math.round(touchpadEndTime) + "," + 320 + "," + 140 + "\r\n";
	
	// some code here
	
	// output to map
	eventsData = evtArray.join("\r\n") + "\r\n" + sData + musicmark + ll_hitlights;
	generalData = generalData.replace(/StackLeniency: ?[0-9\.]*\r?\n/i, "StackLeniency: 0\r\n");
	output("bm_ll complete!")
	diffname_buff("ll");
	br_close();
}