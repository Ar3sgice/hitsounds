/* init global data chunks */

var generalData = "";
var editorData = "";
var metaData = "";
var diffData = "";
var timingSectionData = "";
var colorsData = "";
var eventsData = "";
var objectsData = "";
var hitObjs = [];
var hitObjectArray = [];
var sliderMultiplier = 3.6;
var diffSettings = {};
var _source = "";
var _tags = "";
var _titleUnicode = "";
var _artistUnicode = "";
var is_map_loaded = 0;

/* functions */

var slider_baselength = 100;
var timingSections = [];
var uninheritedSections = [];
var cho = 0;

function parseDiffdata(diffData)
{
	var AR_Correspondence = [1800,1700,1600,1450,1325,1200,1050,900,750,600,450];
	var CS_Correspondence = [128/128,118/128,108/128,98/128,88/128,78/128,68/128,56/128,46/128,36/128,26/128];
	diffSettings.HD = Math.min(parseFloat(diffData.match(/HPDrainRate:([0-9\.]+)/i)[1]),10);
	diffSettings.CS = parseFloat(diffData.match(/CircleSize:([0-9\.]+)/i)[1]);
	diffSettings.OD = parseFloat(diffData.match(/OverallDifficulty:([0-9\.]+)/i)[1]);
	diffSettings.SV = parseFloat(diffData.match(/SliderMultiplier:([0-9\.]+)/i)[1]);
	diffSettings.STR = Math.min(parseInt(diffData.match(/SliderTickRate:([0-9]+)/i)[1]),8);
	var AR = diffData.match(/ApproachRate:([0-9\.]+)/i);
	if(AR != null)
	{
		AR = parseFloat(AR[1]);
	}
	else
	{
		AR = diffSettings.OD;
	}
	diffSettings.AR = AR;
	var AR_BaseTime = AR>5 ? 1950 - 150*AR : 1800 - 1200*AR;
	APC_ScaleTime = AR_BaseTime;
	HC_StandingTime = AR_BaseTime;
	APC_FadeInTime = Math.round(AR_BaseTime / 3);
	HC_FadeInTime = Math.round(AR_BaseTime / 3);
	HC_FadeIn2Time = Math.round(AR_BaseTime / 3);
	HC_FadeIn2Dur = Math.round(AR_BaseTime / 15);
	//HC_ExplosionTime = Math.round(AR_BaseTime / 8);
	//HC_FadeOutTime = Math.round(AR_BaseTime / 4);
	circleScaling = (128 - 10 * diffSettings.CS) / 128 * (0.85);
}

function reparseDiffdata()
{
	var o = "";
	o += "HPDrainRate:" + diffSettings.HD;
	o += "\r\nCircleSize:" + diffSettings.CS;
	o += "\r\nOverallDifficulty:" + diffSettings.OD;
	o += "\r\nApproachRate:" + diffSettings.AR;
	o += "\r\nSliderMultiplier:" + diffSettings.SV;
	o += "\r\nSliderTickRate:" + diffSettings.STR;
	return o;
}

function parseHitObjects()
{
	for(var i=0;i<hitObjs.length;i++)
	{
		var j = hitObjs[i].split(",");
		var v = {};
		v.x = parseInt(j[0]);
		v.y = parseInt(j[1]);
		v.time = parseInt(j[2]);
		v.type = parseInt(j[3]);
		v.hitsounds = parseInt(j[4]);
		v.sliderPoints = j[5];
		if(v.type & 2) // cannot decide with v.sliderPoints
		{
			v.sliderPoints = v.sliderPoints.split("|");
			v.sliderExtHitsounds = j[9];
			if(v.sliderExtHitsounds)
			{
				v.sliderExtHitsounds = v.sliderExtHitsounds.split("|");
			}
			v.extHitsounds = j[10];
		}
		else
		{
			v.extHitsounds = j[5];
		}
		v.sliderReverses = parseInt(j[6]);
		v.sliderLength = parseFloat(j[7]);
		v.sliderSingleHitsounds = j[8];
		if(v.sliderSingleHitsounds)
		{
			v.sliderSingleHitsounds = v.sliderSingleHitsounds.split("|");
		}
		v.index = i;
		hitObjectArray.push(v);
	}
}

function reparseHitObjects()
{
	var o = "";
	for(var i=0;i<hitObjectArray.length;i++)
	{
		var v = hitObjectArray[i];
		var j = "";
		j += v.x + "," + v.y + "," + v.time + "," + v.type + "," + v.hitsounds;
		if(v.type & 2)
		{
			j += "," + v.sliderPoints.join("|");
			j += "," + v.sliderReverses;
			j += "," + v.sliderLength;
			if(v.sliderSingleHitsounds)
			{
				j += "," + v.sliderSingleHitsounds.join("|");
			}
			else if(v.sliderExtHitsounds)
			{
				j += "," + "0";
				for(var s=0;s<v.sliderReverses;s++)
				{
					j += "|0";
				}
			}
			if(v.sliderExtHitsounds)
			{
				j += "," + v.sliderExtHitsounds.join("|");
				if(v.extHitsounds)
				{
					j += "," + v.extHitsounds;
				}
			}
		}
		else
		{
			if(v.extHitsounds)
			{
				j += "," + v.extHitsounds;
			}
		}
		o += j;
		if(i != hitObjectArray.length - 1)
		{
			o += "\r\n";
		}
	}
	return o;
}

function parseTimeSections(timeData)
{
	var curTL = 1;
	var curMP = 1;
	var a = timeData.replace(/\t/ig,",").replace(/^(\r?\n)+/ig,"").replace(/(\r?\n)+$/ig,"").split(/\r?\n/i);
	for(var i=0;i<a.length;i++)
	{
		var ts = {};
		var j = a[i].split(",");
		var tl = parseFloat(j[1]);
		ts.bpm = Math.max(12,60000 / ts.tickLength);
		ts.beginTime = Math.round(parseFloat(j[0]));
		ts.whiteLines = parseInt(j[2]);
		ts.sampleSet = j[3]==1?"normal":"soft";
		ts.customSet = parseInt(j[4]);
		ts.volume = parseInt(j[5]);
		if(tl < 0 && curTL > 0)
		{
			ts.tickLength = curTL;
			ts.sliderLength = slider_baselength * diffSettings.SV * (100/(-tl)) / 1;
			curMP = 100/(-tl);
		}
		else
		{
			curTL = tl;
			ts.tickLength = tl;
			ts.sliderLength = slider_baselength * diffSettings.SV * 1 / 1;
			curMP = 1;
		}
		timingSections.push(ts);
		if(tl > 0)
		{
			uninheritedSections.push(ts);
		}
	}
}

function getSliderLen(t)
{
	var n = 0;
	for(var k=0;k<timingSections.length;k++)
	{
		if(t >= timingSections[k].beginTime)
		{
			n = k;
		}
		else
		{
			return timingSections[n].sliderLength;
		}
	}
	return timingSections[n].sliderLength;
}

function getTickLen(t)
{
	var n = 0;
	for(var k=0;k<timingSections.length;k++)
	{
		if(t >= timingSections[k].beginTime)
		{
			n = k;
		}
		else
		{
			return timingSections[n].tickLength;
		}
	}
	return timingSections[n].tickLength;
}

function parseMeta(metaData)
{
	var artist = "";
	var title = "";
	var _artist = metaData.match(/(^|\n)Artist:([^\r\n]*)(\r?\n|$)/i) || "";
	if(_artist.length)
	{
		artist=_artist[2].replace(/^[ \t]+/ig,"").replace(/[ \t]+$/ig,"");
	}
	var artist2 = metaData.match(/(^|\n)ArtistUnicode:([^\r\n]*)(\r?\n|$)/i) || _artist;
	if(artist2.length)
	{
		artist2=artist2[2].replace(/^[ \t]+/ig,"").replace(/[ \t]+$/ig,"");
	}
	var creator = metaData.match(/(^|\n)Creator:([^\r\n]*)(\r?\n|$)/i) || "";
	if(creator.length)
	{
		creator=creator[2].replace(/^[ \t]+/ig,"").replace(/[ \t]+$/ig,"");
	}
	var _title = metaData.match(/(^|\n)Title:([^\r\n]*)(\r?\n|$)/i) || "";
	if(_title.length)
	{
		title=_title[2].replace(/^[ \t]+/ig,"").replace(/[ \t]+$/ig,"");
	}
	var title2 = metaData.match(/(^|\n)TitleUnicode:([^\r\n]*)(\r?\n|$)/i) || _title;
	if(title2.length)
	{
		title2=title2[2].replace(/^[ \t]+/ig,"").replace(/[ \t]+$/ig,"");
	}
	var diffname = metaData.match(/(^|\n)Version:([^\r\n]*)(\r?\n|$)/i) || "";
	if(diffname.length)
	{
		diffname=diffname[2].replace(/^[ \t]+/ig,"").replace(/[ \t]+$/ig,"");
	}
	var source = metaData.match(/(^|\n)Source:([^\r\n]*)(\r?\n|$)/i) || "";
	if(source.length)
	{
		source=source[2].replace(/^[ \t]+/ig,"").replace(/[ \t]+$/ig,"");
	}
	var tags = metaData.match(/(^|\n)Tags:([^\r\n]*)(\r?\n|$)/i) || "";
	if(tags.length)
	{
		tags=tags[2].replace(/^[ \t]+/ig,"").replace(/[ \t]+$/ig,"");
	}
	$("mapstat_artist").value = artist;
	$("mapstat_artist2").value = artist2;
	$("mapstat_diff").value = diffname;
	$("mapstat_mapper").value = creator;
	$("mapstat_title").value = title;
	$("mapstat_title2").value = title2;
	$("mapstat_source").value = source;
	$("mapstat_tags").value = tags;
}

function getFilename()
{
	var artist = $("mapstat_artist").value;
	var title = $("mapstat_title").value;
	var creator = $("mapstat_mapper").value;
	var diffname = $("mapstat_diff").value;
	var outname = (artist?artist+" - ":"") + title + " (" + creator + ") [" + diffname + "].osu";
	outname = outname.replace(/[^a-z0-9\(\)\[\] \.\,\!\~\`\{\}\-\_\=\+\&\^\@\#\$\%\;\']/ig,"");
	return outname;
}

function reparseMeta()
{
	var o = "";
	o += "Title:" + $("mapstat_title").value + "\r\n";
	if($("mapstat_title2").value.length)
	{
		o += "TitleUnicode:" + $("mapstat_title2").value + "\r\n";
	}
	o += "Artist:" + $("mapstat_artist").value + "\r\n";
	if($("mapstat_artist2").value.length)
	{
		o += "ArtistUnicode:" + $("mapstat_artist2").value + "\r\n";
	}
	o += "Creator:" + $("mapstat_mapper").value + "\r\n";
	o += "Version:" + $("mapstat_diff").value + "\r\n";
	o += "Source:" + $("mapstat_source").value + "\r\n";
	o += "Tags:" + $("mapstat_tags").value;
	return o;
}

function isWhiteLine(t,err,ext)
{
	var err = err || 3;
	var ext = ext || 0;
	var us = uninheritedSections;
	if(!us.length)
	{
		return false;
	}
	if(t < us[0].beginTime)
	{
		return false;
	}
	for(var i=0;i<us.length;i++)
	{
		if(t > us[i].beginTime && ((i == us.length - 1) || t < us[1+i].beginTime))
		{
			t -= ext * us[i].tickLength;
			if(Math.abs((t - us[i].beginTime) % us[i].tickLength) <= err)
			{
				return 1 + (Math.round(Math.abs(t - us[i].beginTime) / us[i].tickLength) % us[i].whiteLines);
			}
			else if(Math.abs((t - us[i].beginTime) % us[i].tickLength - us[i].tickLength) <= err)
			{
				return 1 + (Math.round(Math.abs(t - us[i].beginTime) / us[i].tickLength) % us[i].whiteLines);
			}
			else
			{
				return false;
			}
		}
	}
}

function isWhiteLine2(t,divisor,err,ext)
{
	var err = err || 3;
	var ext = ext || 0;
	var us = uninheritedSections;
	if(!us.length)
	{
		return false;
	}
	if(t < us[0].beginTime)
	{
		return false;
	}
	for(var i=0;i<us.length;i++)
	{
		if(t > us[i].beginTime && ((i == us.length - 1) || t < us[1+i].beginTime))
		{
			var tkl = us[i].tickLength / divisor;
			t -= ext * tkl;
			if(Math.abs((t - us[i].beginTime) % tkl) <= err)
			{
				return 1 + (Math.round(Math.abs(t - us[i].beginTime) / tkl));
			}
			else if(Math.abs((t - us[i].beginTime) % tkl - tkl) <= err)
			{
				return 1 + (Math.round(Math.abs(t - us[i].beginTime) / tkl));
			}
			else
			{
				return false;
			}
		}
	}
}

function makeClaps(param)
{
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	var w = 0;
	var w2 = 0;
	for(var i in hitObjectArray)
	{
		if(hitObjectArray[i].time < dTimeStart || hitObjectArray[i].time > dTimeEnd)
		{
			continue;
		}
		if(hitObjectArray[i].type & 1)
		{
			switch(param)
			{
				case 1:
				w = isWhiteLine(hitObjectArray[i].time);
				if(w == 2 || w == 4)
				{
					hitObjectArray[i].hitsounds |= 8;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 23;
				}
				break;
				case 2:
				w = isWhiteLine(hitObjectArray[i].time);
				if(w == 1 || w == 3)
				{
					hitObjectArray[i].hitsounds |= 8;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 23;
				}
				break;
				case 3:
				w = isWhiteLine(hitObjectArray[i].time,3,1/2);
				if(w)
				{
					hitObjectArray[i].hitsounds |= 8;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 23;
				}
				break;
				case 4:
				w = isWhiteLine(hitObjectArray[i].time);
				if(w == 2 || w == 3)
				{
					hitObjectArray[i].hitsounds |= 8;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 23;
				}
				break;
				case 5:
				w = isWhiteLine(hitObjectArray[i].time);
				if(w == 2 || w == 4)
				{
					hitObjectArray[i].hitsounds |= 2;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 29;
				}
				break;
				case 6:
				w = isWhiteLine(hitObjectArray[i].time);
				if(w == 2)
				{
					hitObjectArray[i].hitsounds |= 2;
					hitObjectArray[i].hitsounds &= 23;
				}
				else if(w == 4)
				{
					hitObjectArray[i].hitsounds |= 8;
					hitObjectArray[i].hitsounds &= 29;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 21;
				}
				break;
				case 7:
				w = isWhiteLine(hitObjectArray[i].time);
				if(w == 4)
				{
					hitObjectArray[i].hitsounds |= 2;
					hitObjectArray[i].hitsounds &= 23;
				}
				else if(w == 2)
				{
					hitObjectArray[i].hitsounds |= 8;
					hitObjectArray[i].hitsounds &= 29;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 21;
				}
				break;
				case 8:
				hitObjectArray[i].hitsounds = 0;
				hitObjectArray[i].extHitsounds = "0:0:0";
				break;
				case 9:
				if((hitObjectArray[i].hitsounds & 8) || (hitObjectArray[i].hitsounds & 2))
				{
					hitObjectArray[i].hitsounds &= 21;
				}
				else
				{
					hitObjectArray[i].hitsounds |= 2;
				}
				break;
				case 10:
				w = isWhiteLine(hitObjectArray[i].time);
				if(w == 1)
				{
					hitObjectArray[i].hitsounds |= 4;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 27;
				}
				break;
				case 11:
				if(Math.random() > 0.5)
				{
					hitObjectArray[i].hitsounds &= 21;
				}
				else
				{
					hitObjectArray[i].hitsounds |= 2;
				}
				break;
				case 12:
				w = isWhiteLine(hitObjectArray[i].time);
				w2 = isWhiteLine(hitObjectArray[i].time,3,1/2);
				if(w == 2 || w == 4 || w2 == 3)
				{
					hitObjectArray[i].hitsounds |= 8;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 23;
				}
				break;
				case 13:
				w = isWhiteLine(hitObjectArray[i].time);
				if(w == 1)
				{
					hitObjectArray[i].hitsounds |= 8;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 23;
				}
				break;
				case 14:
				w = isWhiteLine(hitObjectArray[i].time);
				if(w == 2)
				{
					hitObjectArray[i].hitsounds |= 8;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 23;
				}
				break;
				case 15:
				w = isWhiteLine(hitObjectArray[i].time);
				if(w == 3)
				{
					hitObjectArray[i].hitsounds |= 8;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 23;
				}
				break;
				case 16:
				w = isWhiteLine(hitObjectArray[i].time);
				if(w == 4)
				{
					hitObjectArray[i].hitsounds |= 8;
				}
				else
				{
					hitObjectArray[i].hitsounds &= 23;
				}
				break;
			}
		}
		else if(hitObjectArray[i].type & 2)
		{
			var ticks = hitObjectArray[i].sliderLength / getSliderLen(hitObjectArray[i].time);
			var tickLength = getTickLen(hitObjectArray[i].time);
			if(!hitObjectArray[i].sliderSingleHitsounds)
			{
				hitObjectArray[i].sliderSingleHitsounds = [];
				for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
				{
					hitObjectArray[i].sliderSingleHitsounds.push(0);
				}
			}
			if(!hitObjectArray[i].sliderExtHitsounds)
			{
				hitObjectArray[i].sliderExtHitsounds = [];
				for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
				{
					hitObjectArray[i].sliderExtHitsounds.push("0:0");
				}
				hitObjectArray[i].extHitsounds = "0:0:0";
			}
			for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
			{
				var c_tick = Math.round(hitObjectArray[i].time + j * ticks * tickLength);
				switch(param)
				{
					case 1:
					w = isWhiteLine(c_tick);
					if(w == 2 || w == 4)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 8;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 23;
					}
					break;
					case 2:
					w = isWhiteLine(c_tick);
					if(w == 1 || w == 3)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 8;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 23;
					}
					break;
					case 3:
					w = isWhiteLine(c_tick,3,1/2);
					if(w)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 8;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 23;
					}
					break;
					case 4:
					w = isWhiteLine(c_tick);
					if(w == 2 || w == 3)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 8;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 23;
					}
					break;
					case 5:
					w = isWhiteLine(c_tick);
					if(w == 2 || w == 4)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 2;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 29;
					}
					break;
					case 6:
					w = isWhiteLine(c_tick);
					if(w == 2)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 2;
						hitObjectArray[i].sliderSingleHitsounds[j] &= 23;
					}
					else if(w == 4)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 8;
						hitObjectArray[i].sliderSingleHitsounds[j] &= 29;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 21;
					}
					break;
					case 7:
					w = isWhiteLine(c_tick);
					if(w == 4)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 2;
						hitObjectArray[i].sliderSingleHitsounds[j] &= 23;
					}
					else if(w == 2)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 8;
						hitObjectArray[i].sliderSingleHitsounds[j] &= 29;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 21;
					}
					break;
					case 8:
					hitObjectArray[i].sliderSingleHitsounds[j] = 0;
					hitObjectArray[i].sliderExtHitsounds[j] = "0:0";
					break;
					case 10:
					w = isWhiteLine(c_tick);
					if(w == 1)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 4;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 27;
					}
					break;
					case 11:
					if(Math.random() > 0.5)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 21;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 2;
					}
					break;
					case 12:
					w = isWhiteLine(c_tick);
					w2 = isWhiteLine(c_tick,3,1/2);
					if(w == 2 || w == 4 || w2 == 3)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 8;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 23;
					}
					break;
					case 13:
					w = isWhiteLine(c_tick);
					if(w == 1)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 8;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 23;
					}
					break;
					case 14:
					w = isWhiteLine(c_tick);
					if(w == 2)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 8;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 23;
					}
					break;
					case 15:
					w = isWhiteLine(c_tick);
					if(w == 3)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 8;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 23;
					}
					break;
					case 16:
					w = isWhiteLine(c_tick);
					if(w == 4)
					{
						hitObjectArray[i].sliderSingleHitsounds[j] |= 8;
					}
					else
					{
						hitObjectArray[i].sliderSingleHitsounds[j] &= 23;
					}
					break;
				}
			}
		}
	}
}

function csp()
{
	makeClaps2($("float_custompattern_pattern").value,parseInt($("float_custompattern_divisor").value));
	diffname_buff("custompattern");
	output("Custom pattern done!");
	csp_close();
}

function makeClaps2(streamData,divisor)
{
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	var w = 0;
	var w2 = 0;
	var streamArray = streamData.split(":");
	var stream = streamArray[0];
	var strSample = streamArray[1];
	var strAdd = streamArray[2];
	for(var i in hitObjectArray)
	{
		if(hitObjectArray[i].time < dTimeStart || hitObjectArray[i].time > dTimeEnd)
		{
			continue;
		}
		if(hitObjectArray[i].type & 1)
		{
			w = isWhiteLine2(hitObjectArray[i].time,divisor);
			if(w)
			{
				hitObjectArray[i].hitsounds = 2 * parseInt(stream.charAt((w - 1) % stream.length),16);
				hitObjectArray[i].extHitsounds = parseInt(strSample.charAt((w - 1) % strSample.length),16)
																 + ":" + parseInt(strAdd.charAt((w - 1) % strAdd.length),16) + ":0";
			}
		}
		else if(hitObjectArray[i].type & 2)
		{
			var ticks = hitObjectArray[i].sliderLength / getSliderLen(hitObjectArray[i].time);
			var tickLength = getTickLen(hitObjectArray[i].time);
			if(!hitObjectArray[i].sliderSingleHitsounds)
			{
				hitObjectArray[i].sliderSingleHitsounds = [];
				for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
				{
					hitObjectArray[i].sliderSingleHitsounds.push(0);
				}
			}
			if(!hitObjectArray[i].sliderExtHitsounds)
			{
				hitObjectArray[i].sliderExtHitsounds = [];
				for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
				{
					hitObjectArray[i].sliderExtHitsounds.push("0:0");
				}
				hitObjectArray[i].extHitsounds = "0:0:0";
			}
			for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
			{
				var c_tick = Math.round(hitObjectArray[i].time + j * ticks * tickLength);
				w = isWhiteLine2(c_tick,divisor);
				if(w)
				{
					hitObjectArray[i].sliderSingleHitsounds[j] = 2 * parseInt(stream.charAt((w - 1) % stream.length),16);
					hitObjectArray[i].sliderExtHitsounds[j] = parseInt(strSample.charAt((w - 1) % strSample.length),16)
																						+ ":" + parseInt(strAdd.charAt((w - 1) % strAdd.length),16);
				}
			}
		}
	}
}

function csp_createCheckboxArray()
{
	var lkp = "float_custompattern_";
	var totalLines = parseInt($(lkp + "rticks").value);
	var snapDivisor = parseInt($(lkp + "divisor").value);
	var arrayCheckbox = [$(lkp + "tr1"),$(lkp + "tr2"),$(lkp + "tr3")];
	var arrayCheckboxText = ["Whistle","Finish","Clap"];
	var arrayInput = [$(lkp + "tr4"),$(lkp + "tr5")];
	var arrayInputText = ["Sample","Add"];
	var k1 = $(lkp + "tree");
	while(k1.hasChildNodes())
	{
		k1.removeChild(k1.firstChild);
	}
	for(var k in arrayCheckbox)
	{
		var k1 = arrayCheckbox[k];
		while(k1.hasChildNodes())
		{
			k1.removeChild(k1.firstChild);
		}
	}
	for(var k in arrayInput)
	{
		var k1 = arrayInput[k];
		while(k1.hasChildNodes())
		{
			k1.removeChild(k1.firstChild);
		}
	}
	for(var k in arrayCheckbox)
	{
		var w = document.createElement("td");
		w.className = "float_custompattern_down";
		w.innerHTML = arrayCheckboxText[k];
		arrayCheckbox[k].appendChild(w);
		for(var i=0;i<totalLines;i++)
		{
			var w = document.createElement("td");
			w.className = "float_custompattern_check";
			var w2 = document.createElement("input");
			w2.type = "checkbox";
			w2.className = "float_custompattern_checkbox";
			w2.onclick = csp_updatePattern;
			w.appendChild(w2);
			arrayCheckbox[k].appendChild(w);
		}
	}
	for(var k in arrayInput)
	{
		var w = document.createElement("td");
		w.className = "float_custompattern_down";
		w.innerHTML = arrayInputText[k];
		arrayInput[k].appendChild(w);
		for(var i=0;i<totalLines;i++)
		{
			var w = document.createElement("td");
			w.className = "float_custompattern_text";
			var w2 = document.createElement("input");
			w2.type = "text";
			w2.className = "float_custompattern_text";
			w2.value = "0";
			w2.maxLength = "1";
			w2.onkeyup = csp_updatePattern;
			w.appendChild(w2);
			arrayInput[k].appendChild(w);
		}
	}
	var k1 = $(lkp + "tree");
	var w = document.createElement("td");
	w.className = "float_custompattern_check";
	k1.appendChild(w);
	for(var i=0;i<totalLines;i++)
	{
		var w = document.createElement("td");
		w.className = "float_custompattern_lines";
		var w_color = "";
		switch(snapDivisor)
		{
			case 2:
			if(i % 2 == 1)
			{
				w_color = "#FF5353";
			}
			else
			{
				w_color = "#D7D7D7";
			}
			break;
			case 3:
			if(i % 3 == 0)
			{
				w_color = "#D7D7D7";
			}
			else
			{
				w_color = "#BD24FF";
			}
			break;
			case 4:
			if(i % 4 == 0)
			{
				w_color = "#D7D7D7";
			}
			else if(i % 2 == 0)
			{
				w_color = "#FF5353";
			}
			else
			{
				w_color = "#5BB1FF";
			}
			break;
			case 6:
			if(i % 6 == 0)
			{
				w_color = "#D7D7D7";
			}
			else if(i % 3 == 0)
			{
				w_color = "#FF5353";
			}
			else
			{
				w_color = "#BD24FF";
			}
			break;
			case 8:
			if(i % 8 == 0)
			{
				w_color = "#D7D7D7";
			}
			else if(i % 4 == 0)
			{
				w_color = "#FF5353";
			}
			else if(i % 2 == 0)
			{
				w_color = "#5BB1FF";
			}
			else
			{
				w_color = "#FFF433";
			}
			break;
			case 1:
			default:
			w_color = "#D7D7D7";
		}
		w.style.color = w_color;
		w.innerHTML = "|";
		k1.appendChild(w);
	}
}

function csp_updatePattern()
{
	var o = "";
	var lkp = "float_custompattern_";
	var totalLines = parseInt($(lkp + "rticks").value);
	for(var i=1;i<=totalLines;i++)
	{
		var w1 = !!$(lkp + "tr1").childNodes[i].childNodes[0].checked;
		var w2 = !!$(lkp + "tr2").childNodes[i].childNodes[0].checked;
		var w3 = !!$(lkp + "tr3").childNodes[i].childNodes[0].checked;
		o += (w1 * 1 + w2 * 2 + w3 * 4) + "";
	}
	o += ":";
	for(var i=1;i<=totalLines;i++)
	{
		var w = $(lkp + "tr4").childNodes[i].childNodes[0].value;
		o += parseInt(w) + "";
	}
	o += ":";
	for(var i=1;i<=totalLines;i++)
	{
		var w = $(lkp + "tr5").childNodes[i].childNodes[0].value;
		o += parseInt(w) + "";
	}
	$(lkp + "pattern").value = o;
}

var csp_moveTimer = 0;
var csp_goRightTimer = 0;

function csp_goLeft()
{
	if(!csp_moveTimer)
	{
		csp_moveTimer = setInterval(csp_goLeft_act,25);
	}
}

function csp_open()
{
	if(!is_map_loaded)
	{
		output("No map data!");
		return;
	}
	csp_createCheckboxArray();
	$("float_custompattern").style.display = "block";
}

function csp_close()
{
	$("float_custompattern").style.display = "none";
}

function csp_goRight()
{
	if(!csp_moveTimer)
	{
		csp_moveTimer = setInterval(csp_goRight_act,25);
	}
}

function csp_moveEnd()
{
	if(csp_moveTimer)
	{
		clearInterval(csp_moveTimer);
		csp_moveTimer = 0;
	}
}

function csp_goLeft_act()
{
	var tb = $("float_custompattern_table");
	if(!tb.style.marginLeft)
	{
		tb.style.marginLeft = "0px";
	}
	var w = parseInt(tb.style.marginLeft);
	if(tb.offsetWidth + w > 294-40)
	{
		w -= Math.min(5,tb.offsetWidth+w-294+40);
		tb.style.marginLeft = w + "px";
	}
}

function csp_goRight_act()
{
	var tb = $("float_custompattern_table");
	if(!tb.style.marginLeft)
	{
		tb.style.marginLeft = "0px";
	}
	var w = parseInt(tb.style.marginLeft);
	if(w < 0)
	{
		w += 5;
		if(w > 0)
		{
			w = 0;
		}
		tb.style.marginLeft = w + "px";
	}
}

function csl_save()
{
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	var ar = [];
	for(var i in hitObjectArray)
	{
		if(hitObjectArray[i].time < dTimeStart || hitObjectArray[i].time > dTimeEnd)
		{
			continue;
		}
		if(hitObjectArray[i].type & 1)
		{
			if(!hitObjectArray[i].extHitsounds)
			{
				hitObjectArray[i].extHitsounds = "0:0:0";
			}
			ar.push((hitObjectArray[i].time - dTimeStart) + "," + hitObjectArray[i].hitsounds + "," + hitObjectArray[i].extHitsounds.substr(0,3));
		}
		else if(hitObjectArray[i].type & 2)
		{
			var ticks = hitObjectArray[i].sliderLength / getSliderLen(hitObjectArray[i].time);
			var tickLength = getTickLen(hitObjectArray[i].time);
			if(!hitObjectArray[i].sliderSingleHitsounds)
			{
				hitObjectArray[i].sliderSingleHitsounds = [];
				for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
				{
					hitObjectArray[i].sliderSingleHitsounds.push(hitObjectArray[i].hitsounds);
				}
			}
			if(!hitObjectArray[i].sliderExtHitsounds)
			{
				hitObjectArray[i].sliderExtHitsounds = [];
				for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
				{
					hitObjectArray[i].sliderExtHitsounds.push("0:0");
				}
				hitObjectArray[i].extHitsounds = "0:0:0";
			}
			for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
			{
				var c_tick = Math.round(hitObjectArray[i].time + j * ticks * tickLength);
				ar.push((c_tick - dTimeStart) + "," + hitObjectArray[i].sliderSingleHitsounds[j] + "," + hitObjectArray[i].sliderExtHitsounds[j]);
			}
		}
	}
	localStorage["hst_saved_hitsounds"] = ar.join("\r\n");
	output("Hitsound Pattern Saved!");
	return;
}

function csl_load()
{
	var dTimeStart = parseInt($("additional_timestart").value);
	var dTimeEnd = parseInt($("additional_timeend").value);
	var err = 3;
	var ar = [];
	if(!localStorage["hst_saved_hitsounds"] || !localStorage["hst_saved_hitsounds"].length)
	{
		output("No map data!");
		return;
	}
	var fr = localStorage["hst_saved_hitsounds"];
	ar = fr.split(/\r?\n/);
	for(var i in ar)
	{
		ar[i] = ar[i].split(",");
		ar[i][0] = parseInt(ar[i][0]);
	}
	var p = 0;
	for(var i in hitObjectArray)
	{
		if(hitObjectArray[i].time < dTimeStart || hitObjectArray[i].time > dTimeEnd)
		{
			continue;
		}
		if(hitObjectArray[i].type & 1)
		{
			var c_tick = hitObjectArray[i].time - dTimeStart;
			while(ar[p] && ar[p][0] <= c_tick + err)
			{
				p++;
			}
			if(p > 0)
			{
				p--;
			}
			if(ar[p][0] >= c_tick - err)
			{
				hitObjectArray[i].hitsounds = parseInt(ar[p][1]);
				if(hitObjectArray[i].extHitsounds)
				{
					hitObjectArray[i].extHitsounds = ar[p][2] + hitObjectArray[i].extHitsounds.substr(3,2);
				}
				else
				{
					hitObjectArray[i].extHitsounds = ar[p][2] + ":0";
				}
			}
		}
		else if(hitObjectArray[i].type & 2)
		{
			var ticks = hitObjectArray[i].sliderLength / getSliderLen(hitObjectArray[i].time);
			var tickLength = getTickLen(hitObjectArray[i].time);
			if(!hitObjectArray[i].sliderSingleHitsounds)
			{
				hitObjectArray[i].sliderSingleHitsounds = [];
				for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
				{
					hitObjectArray[i].sliderSingleHitsounds.push(hitObjectArray[i].hitsounds);
				}
			}
			if(!hitObjectArray[i].sliderExtHitsounds)
			{
				hitObjectArray[i].sliderExtHitsounds = [];
				for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
				{
					hitObjectArray[i].sliderExtHitsounds.push("0:0");
				}
				hitObjectArray[i].extHitsounds = "0:0:0";
			}
			for(var j=0;j<=hitObjectArray[i].sliderReverses;j++)
			{
				var c_tick = Math.round(hitObjectArray[i].time + j * ticks * tickLength) - dTimeStart;
				while(ar[p] && ar[p][0] <= c_tick + err)
				{
					p++;
				}
				if(p > 0)
				{
					p--;
				}
				if(ar[p][0] >= c_tick - err)
				{
					hitObjectArray[i].sliderSingleHitsounds[j] = parseInt(ar[p][1]);
					hitObjectArray[i].sliderExtHitsounds[j] = ar[p][2];
				}
			}
		}
	}
	diffname_buff("loaded");
	output("Hitsound Pattern Loaded!");
	return;
}

function output(str)
{
	var max_lines = 12;
	var v_str = str.replace(/\r/g,"\\r").replace(/\n/g,"\\n");
	var p_data = $("output_data").value;
	if(p_data.split(/\r?\n/).length >= max_lines)
	{
		p_data = p_data.replace(/[^\r\n]+\r?\n$/ig,"");
	}
	p_data = v_str + "\r\n" + p_data;
	$("output_data").value = p_data;
}

function load_map(param,txt)
{
	if(txt)
	{
		var inputdata = txt;
	}
	else if($("load_map_file").value || ($("load_map_file").files && $("load_map_file").files.length))
	{
		var inputdata = getFileData($("load_map_file"),"text",function(txt){load_map(param,txt)});
		return;
	}
	else
	{
		output("No map data or cannot load file!");
		return;
	}
	
	generalData = [];
	editorData = [];
	metaData = [];
	diffData = [];
	timingSectionData = [];
	colorsData = [];
	eventsData = [];
	objectsData = [];
	hitObjs = [];
	hitObjectArray = [];
	sliderMultiplier = 3.6;
	diffSettings = {};
	_source = "";
	_tags = "";
	timingSections = [];
	uninheritedSections = [];
	
	var linesepar = inputdata.split(/\r?\n/i);
	for(var i=0;i<linesepar.length;i++)
	{
		if(linesepar[i].indexOf("[General]") == 0)
		{
			while(linesepar[i+1] && !linesepar[i+1].match(/^\[[a-z]+\]/i))
			{
				i++;
				generalData.push(linesepar[i]);
			}
			continue;
		}
		else if(linesepar[i].indexOf("[Editor]") == 0)
		{
			while(linesepar[i+1] && !linesepar[i+1].match(/^\[[a-z]+\]/i))
			{
				i++;
				editorData.push(linesepar[i]);
			}
			continue;
		}
		else if(linesepar[i].indexOf("[Metadata]") == 0)
		{
			while(linesepar[i+1] && !linesepar[i+1].match(/^\[[a-z]+\]/i))
			{
				i++;
				metaData.push(linesepar[i]);
			}
			continue;
		}
		else if(linesepar[i].indexOf("[Difficulty]") == 0)
		{
			while(linesepar[i+1] && !linesepar[i+1].match(/^\[[a-z]+\]/i))
			{
				i++;
				diffData.push(linesepar[i]);
			}
			continue;
		}
		else if(linesepar[i].indexOf("[TimingPoints]") == 0)
		{
			while(linesepar[i+1] && !linesepar[i+1].match(/^\[[a-z]+\]/i))
			{
				i++;
				timingSectionData.push(linesepar[i]);
			}
			continue;
		}
		else if(linesepar[i].indexOf("[Colours]") == 0)
		{
			while(linesepar[i+1] && !linesepar[i+1].match(/^\[[a-z]+\]/i))
			{
				i++;
				colorsData.push(linesepar[i]);
			}
			continue;
		}
		else if(linesepar[i].indexOf("[Events]") == 0)
		{
			while(linesepar[i+1] && !linesepar[i+1].match(/^\[[a-z]+\]/i))
			{
				i++;
				eventsData.push(linesepar[i]);
			}
			continue;
		}
		else if(linesepar[i].indexOf("[HitObjects]") == 0)
		{
			while(linesepar[i+1] && !linesepar[i+1].match(/^\[[a-z]+\]/i))
			{
				i++;
				objectsData.push(linesepar[i]);
			}
			continue;
		}
	}
	
	generalData = generalData.join("\r\n").replace(/^(\r?\n)+/ig,"").replace(/(\r?\n)+$/ig,"");
	editorData = editorData.join("\r\n").replace(/^(\r?\n)+/ig,"").replace(/(\r?\n)+$/ig,"");
	metaData = metaData.join("\r\n").replace(/^(\r?\n)+/ig,"").replace(/(\r?\n)+$/ig,"");
	diffData = diffData.join("\r\n").replace(/^(\r?\n)+/ig,"").replace(/(\r?\n)+$/ig,"");
	timingSectionData = timingSectionData.join("\r\n").replace(/^(\r?\n)+/ig,"").replace(/(\r?\n)+$/ig,"");
	colorsData = colorsData.join("\r\n").replace(/^(\r?\n)+/ig,"").replace(/(\r?\n)+$/ig,"");
	eventsData = eventsData.join("\r\n").replace(/^(\r?\n)+/ig,"").replace(/(\r?\n)+$/ig,"");
	objectsData = objectsData.join("\r\n").replace(/^(\r?\n)+/ig,"").replace(/(\r?\n)+$/ig,"");
	
	hitObjs = objectsData.replace(/(\r?\n)+$/,"").split(/\r?\n/i);
	
	parseDiffdata(diffData);
	parseTimeSections(timingSectionData);
	parseHitObjects();
	parseMeta(metaData);
	output("Map loaded");
	color_light();
	is_map_loaded = 1;
	return false;
}

function cDist(a,b)
{
	var c01 = (a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y);
	var c02 = Math.abs(b.time-a.time) / Math.abs(getTickLen(a.time));
	return Math.sqrt(c01) / c02;
}

function cDist2(a,b)
{
	var c01 = (a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y);
	var c02 = Math.abs(b.time-a.time) / Math.abs(getTickLen(a.time));
	return (c01 / (c02 * c02));
}

function calcDiff()
{
	var hCount = 0;
	var dc = 0;
	var smallDistN = 0;
	var smallDistAve = 0;
	var smallDistAve2 = 0;
	var bigDistN = 0;
	var bigDistAve = 0;
	var bigDistAve2 = 0;
	var ww = 0;
	var nonstack = 60;
	var hasStreams = 30;
	var k1 = 0.005;
	var k2 = 0.003;
	var k3 = 0.008;
	var k4 = 0.0015;
	var k5 = 0.5;
	var k6 = 1.6;
	var k7 = 0.8;
	var k8 = 800;
	var k9 = 0.0003; /* r_data stream */
	var k10 = 0.025; /* r_data nonstream */
	var k11 = 1.75; /* s_data global power */
	var k0 = 3.4767493237807857779223931876407;
	var first_note_time = hitObjectArray[0].time;
	var last_note_time = hitObjectArray[hitObjectArray.length-1].time;
	var time_length = last_note_time - first_note_time;
	for(var i=0;i<hitObjectArray.length;i++)
	{
		if(hitObjectArray[i].type & 1)
		{
			hCount++;
			if(hitObjectArray[i+1])
			{
				if(hitObjectArray[i+1].time - hitObjectArray[i].time >= getTickLen(hitObjectArray[i].time) * (2/7)
				&& hitObjectArray[i+1].time - hitObjectArray[i].time <= getTickLen(hitObjectArray[i].time) * (4/7)
				&& cDist(hitObjectArray[i],hitObjectArray[i+1]) >= nonstack)
				{
					if(hitObjectArray[i+1].type & 1)
					{
						bigDistN += 1;
						bigDistAve += cDist(hitObjectArray[i],hitObjectArray[i+1]);
						bigDistAve2 += cDist2(hitObjectArray[i],hitObjectArray[i+1]);
					}
					else if(hitObjectArray[i+1].type & 2)
					{
						bigDistN += 0.5;
						bigDistAve += 0.5 * cDist(hitObjectArray[i],hitObjectArray[i+1]);
						bigDistAve2 += 0.5 * cDist2(hitObjectArray[i],hitObjectArray[i+1]);
					}
				}
				else if(hitObjectArray[i+1].time - hitObjectArray[i].time <= getTickLen(hitObjectArray[i].time) * (2/7)
						 && cDist(hitObjectArray[i],hitObjectArray[i+1]) >= nonstack)
				{
					if(hitObjectArray[i+1].type & 1)
					{
						smallDistN += 1;
						smallDistAve += cDist(hitObjectArray[i],hitObjectArray[i+1]);
						smallDistAve2 += cDist2(hitObjectArray[i],hitObjectArray[i+1]);
					}
					else if(hitObjectArray[i+1].type & 2)
					{
						smallDistN += 0.5;
						smallDistAve += 0.5 * cDist(hitObjectArray[i],hitObjectArray[i+1]);
						smallDistAve2 += 0.5 * cDist2(hitObjectArray[i],hitObjectArray[i+1]);
					}
				}
			}
		}
		else if(hitObjectArray[i].type & 2)
		{
			hCount += 1.5;
			if(hitObjectArray[i+1])
			{
				if(hitObjectArray[i+1].time - hitObjectArray[i].time <= getTickLen(hitObjectArray[i].time) * (4/7)
				&& hitObjectArray[i+1].time - hitObjectArray[i].time >= getTickLen(hitObjectArray[i].time) * (2/7)
				&& cDist(hitObjectArray[i],hitObjectArray[i+1]) >= nonstack)
				{
					if(hitObjectArray[i+1].type & 1)
					{
						bigDistN += 0.75;
						bigDistAve += 0.75 * cDist(hitObjectArray[i],hitObjectArray[i+1]);
						bigDistAve2 += 0.75 * cDist2(hitObjectArray[i],hitObjectArray[i+1]);
					}
					else if(hitObjectArray[i+1].type & 2)
					{
						bigDistN += 0.35;
						bigDistAve += 0.35 * cDist(hitObjectArray[i],hitObjectArray[i+1]);
						bigDistAve2 += 0.35 * cDist2(hitObjectArray[i],hitObjectArray[i+1]);
					}
				}
			}
		}
		else
		{
			hCount+=3;
		}
	}
	if(smallDistN)
	{
		var j = 0;
		j = smallDistAve2 - smallDistAve * smallDistAve / smallDistN;
		if(j < 0)
		{
			j = 0;
		}
		smallDistAve = smallDistAve / smallDistN;
		smallDistAve2 = Math.sqrt(j / smallDistN);
	}
	if(bigDistN)
	{
		var j = 0;
		if(j < 0)
		{
			j = 0;
		}
		j = bigDistAve2 - bigDistAve * bigDistAve / bigDistN;
		bigDistAve = bigDistAve / bigDistN;
		bigDistAve2 = Math.sqrt(j / bigDistN);
	}
	var bpm = 0;
	for(var i in uninheritedSections)
	{
		bpm += 60000 / uninheritedSections[i].tickLength;
	}
	bpm /= uninheritedSections.length;
	// jump_difficulty
	var j_data = bigDistAve * k1 + bigDistAve2 * k2 + smallDistAve * k3 + smallDistAve2 * k4;
	j_data = 1 + Math.pow(Math.max(j_data - k5,0),k6) * bpm / 150;
	// stream_difficulty
	var s_data = k8 * Math.pow(hCount / Math.pow(time_length,k7),k11);
	// reaction_difficulty
	var r_data = 0;
	if(smallDistN > hasStreams)
	{
		r_data = Math.pow(Math.max(bpm - 150,0),1.6) * k9 + 1;
	}
	else
	{
		r_data = Math.pow(Math.max(bpm - 180,0),0.8) * k10 + 1;
	}
	var d_data = 1;
	d_data *= Math.max(diffSettings.CS - 1,0) * 1/3;
	d_data *= 1 + Math.max(0,0.02*Math.pow(diffSettings.OD,1.7) - 0.4);
	d_data *= 0.82 + 0.06 * diffSettings.HD;
	var e_data = r_data * s_data * j_data * d_data * k0;
	output("E: " + e_data);
	output("D: " + d_data);
	output("R: " + r_data);
	output("S: " + s_data);
	output("J: " + j_data);
	return dc;
}

function color_light()
{
	var k = $("buff_area").childNodes;
	for(var i in k)
	{
		if(k[i].tagName && k[i].tagName.toUpperCase() == "A")
		{
			k[i].style.color = "#FBFDB0";
		}
	}
}

function color_dark()
{
	var k = $("buff_area").childNodes;
	for(var i in k)
	{
		if(k[i].tagName && k[i].tagName.toUpperCase() == "A")
		{
			k[i].style.color = "#aaaaaa";
		}
	}
}

function epicfail()
{
	document.body.sss = 10;
	document.body.sss2 = 0;
	document.body.style.overflowY = "hidden";
	document.body.style.marginTop = "0px";
	setInterval(failing,25);
	document.title = "Harvisp's Youkai Beatmap Tool (Megurine Luka) [Ipvarsh] [Failed!]";
	return false;
}

function failing()
{
	var q = parseInt(document.body.style.marginTop) + document.body.sss + "px";
	for(var i in document.body.childNodes)
	{
		if(document.body.childNodes[i].id != "float_msie") {
			try{document.body.childNodes[i].style.marginTop = q;}catch(f){}
		}
	}
	document.body.sss2 += 1;
	document.body.sss += document.body.sss2;
}

function save_file()
{
	var filedata = "";
	filedata += "osu file format v14\r\n\r\n[General]\r\n" + generalData + "\r\n\r\n[Editor]\r\n" + editorData;
	filedata += "\r\n\r\n[Metadata]\r\n" + reparseMeta() + "\r\n\r\n";
	filedata += "[Difficulty]\r\n" + reparseDiffdata() + "\r\n\r\n[TimingPoints]\r\n" + timingSectionData + "\r\n\r\n";
	filedata += "[Colours]\r\n" + colorsData + "\r\n\r\n";
	filedata += "[Events]\r\n" + eventsData + "\r\n\r\n";
	filedata +=  "[HitObjects]\r\n" + reparseHitObjects() + "\r\n";
	var fn = getFilename();
	saveFileData(filedata, fn, "application/osu");
	return true;
}

function diffname_buff(m)
{
	var dn = $("mapstat_diff").value;
	if(dn.match(/\-[a-z0-9]+$/i))
	{
		$("mapstat_diff").value = dn.replace(/\-[a-z0-9]+$/ig,"-" + m);
	}
	else
	{
		$("mapstat_diff").value = dn + "-" + m;
	}
}

function wwww(k)
{
	if(!is_map_loaded)
	{
		output("No map data!");
		return;
	}
	makeClaps(k);
	switch(k)
	{
		case 1:
		diffname_buff("24clap");
		output("24 clap added");
		break;
		case 2:
		diffname_buff("13clap");
		output("13 clap added");
		break;
		case 3:
		diffname_buff("rlclap");
		output("Red line clap added");
		break;
		case 4:
		diffname_buff("23clap");
		output("23 clap added");
		break;
		case 5:
		diffname_buff("24whistle");
		output("24 whistle added");
		break;
		case 6:
		diffname_buff("24whis_clap");
		output("24 whistle/clap added");
		break;
		case 7:
		diffname_buff("24clap_whis");
		output("24 clap/whistle added");
		break;
		case 8:
		diffname_buff("nohitsounds");
		output("All hitsounds removed");
		break;
		case 9:
		diffname_buff("inverted");
		output("Made some mysterious changes to the map");
		break;
		case 10:
		diffname_buff("1finish");
		output("Long white line finish added");
		break;
		case 11:
		diffname_buff("rand"+Math.floor(Math.random()*999999));
		output("Randomized whistles");
		break;
		case 12:
		diffname_buff("style12");
		output("Added some claps");
		break;
		case 13:
		diffname_buff("1clap");
		output("1 clap added");
		break;
		case 14:
		diffname_buff("2clap");
		output("2 clap added");
		break;
		case 15:
		diffname_buff("3clap");
		output("3 clap added");
		break;
		case 16:
		diffname_buff("4clap");
		output("4 clap added");
		break;
	}
}

function sv()
{
	if($("load_map_file").value && $("load_map_file").value.length > 2)
	{
		var p = save_file();
		output("File saved");
	}
	else
	{
		output("No map data!");
	}
}

function clear_buff()
{
	$("output_data").value = "";
	$("mapstat_artist").value = "";
	$("mapstat_title").value = "";
	$("mapstat_artist2").value = "";
	$("mapstat_title2").value = "";
	$("mapstat_mapper").value = "";
	$("mapstat_diff").value = "";
	$("mapstat_source").value = "";
	$("mapstat_tags").value = "";
	$("load_map_file").value = "";
	$("additional_timestart").value = 0;
	$("additional_timeend").value = 19911123; /* unless the map is over 5 hour 30 mins, it works as infinity :3 */
	$("float_custompattern_pattern").value = "";
}

function init()
{
	if(!checkFileReaderAvailability())
	{
		$("float_msie").style.display = "block";
		epicfail();
	}
	clear_buff();
	color_dark();
	output("developed by Ar3sgice 2012.3.9-2015.2.19");
	output("osu! beatmap hitsounding/eggpain tool ver 0.7");
}
window.onload = init;