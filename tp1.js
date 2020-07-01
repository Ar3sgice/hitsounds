function getSliderPAT(obj,time)
{
	var ticks = obj.sliderLength / getSliderLen(obj.time);
	var tickLength = getTickLen(obj.time);
	var endTick = Math.round(obj.time + obj.sliderReverses * ticks * tickLength);
	if(time<obj.time || time>endTick+3)
	{
		return [0,0];
	}
	else
	{
		var endpoint = obj.sliderPoints[obj.sliderPoints.length-1].split(":");
		var endX = parseInt(endpoint[0],10);
		var endY = parseInt(endpoint[1],10);
		var m = (time - obj.time) % (2*ticks * tickLength);
		if(m < ticks * tickLength)
		{
			var p = m/(ticks * tickLength);
		}
		else
		{
			var p = 2 - m/(ticks * tickLength);
		}
		return [Math.round(obj.x + (endX - obj.x) * p),Math.round(obj.y + (endY - obj.y) * p)];
	}
}

// Factor by how much speed / aim strain decays per second. Those values are results of tweaking a lot and taking into account general feedback.
var DECAY_BASE = { 'Speed': 0.3, 'Aim': 0.15 }; // Opinionated observation: Speed is easier to maintain than accurate jumps.

var ALMOST_DIAMETER = 90; // Almost the normed diameter of a circle (104 osu pixel). That is -after- position transforming.

// Pseudo threshold values to distinguish between "singles" and "streams". Of course the border can not be defined clearly, therefore the algorithm
// has a smooth transition between those values. They also are based on tweaking and general feedback.
var STREAM_SPACING_TRESHOLD = 110;
var SINGLE_SPACING_TRESHOLD = 125;

// Scaling values for weightings to keep aim and speed difficulty in balance. Found from testing a very large map pool (containing all ranked maps) and keeping the
// average values the same.
var SPACING_WEIGHT_SCALING = { 'Speed': 1400, 'Aim': 26.25 };

// In milliseconds. The smaller the value, the more accurate sliders are approximated. 0 leads to an infinite loop, so use something bigger.
var LAZY_SLIDER_STEP_LENGTH = 1;

var TP = 
{
        


        tpHitObject: function(BaseHitObject, CircleRadius)
        {
            this.BaseHitObject = BaseHitObject;

            // We will scale everything by this factor, so we can assume a uniform CircleSize among beatmaps.
            var ScalingFactor = (52.0 / CircleRadius);
            
						// move declarations here
						var LazySliderLengthFirst = 0;
						var LazySliderLengthSubsequent = 0;
						var Strains = { 'Speed': 1, 'Aim': 1 };
						var NormalizedStartPositionX = 0;
						var NormalizedStartPositionY = 0;
						var NormalizedEndPositionX = 0;
						var NormalizedEndPositionY = 0;
						
            NormalizedStartPositionX = BaseHitObject.x * ScalingFactor;
            NormalizedStartPositionY = BaseHitObject.y * ScalingFactor;
            //var NormalizedStartPosition = BaseHitObject.Position * ScalingFactor;
            

        
            // Calculate approximation of lazy movement on the slider
            if (BaseHitObject.type & 2)
            {
                var SliderFollowCircleRadius = CircleRadius * 3; // Not sure if this is correct, but here we do not need 100% exact values. This comes pretty darn close in my tests.
                //int SegmentLength = BaseHitObject.Length / BaseHitObject.SegmentCount;
								// get the endpoint tick (using my method here)
								var ticks = BaseHitObject.sliderLength / getSliderLen(BaseHitObject.time);
								var tickLength = getTickLen(BaseHitObject.time);
								var endTick = Math.round(BaseHitObject.time + ticks * tickLength);
				
                var SegmentLength = ticks * tickLength;
                var SegmentEndTime = BaseHitObject.time + SegmentLength;

                // For simplifying this step we use actual osu! coordinates and simply scale the length, that we obtain by the ScalingFactor later
                var CursorPosX = BaseHitObject.x;
                var CursorPosY = BaseHitObject.y;
                
                
                // Actual computation of the first lazy curve
                for (var Time = BaseHitObject.time + LAZY_SLIDER_STEP_LENGTH; Time < SegmentEndTime; Time += LAZY_SLIDER_STEP_LENGTH)
                {
                    //Vector2 Difference = BaseHitObject.PositionAtTime(Time) - CursorPos;
                    var Pat = getSliderPAT(BaseHitObject,Time);
                    var DifferenceX = Pat[0] - CursorPosX;
                    var DifferenceY = Pat[1] - CursorPosY;
                    var Distance = distance(CursorPosX,CursorPosY,Pat[0],Pat[1]);

                    // Did we move away too far?
                    if (Distance > SliderFollowCircleRadius)
                    {
                        // Yep, we need to move the cursor
                        DifferenceX /= Distance; 
                        DifferenceY /= Distance; // Obtain the direction of difference. We do no longer need the actual difference
                        Distance -= SliderFollowCircleRadius;
                        CursorPosX += DifferenceX * Distance;
                        CursorPosY += DifferenceY * Distance; // We move the cursor just as far as needed to stay in the follow circle
                        LazySliderLengthFirst += Distance;
                    }
                }

                LazySliderLengthFirst *= ScalingFactor;
                // If we have an odd amount of repetitions the current position will be the end of the slider. Note that this will -always- be triggered if
                // BaseHitObject.SegmentCount <= 1, because BaseHitObject.SegmentCount can not be smaller than 1. Therefore NormalizedEndPosition will always be initialized
                if (BaseHitObject.sliderReverses % 2 == 1)
                {
                    NormalizedEndPositionX = CursorPosX * ScalingFactor;
                    NormalizedEndPositionY = CursorPosY * ScalingFactor;
                }

                // If we have more than one segment, then we also need to compute the length ob subsequent lazy curves. They are different from the first one, since the first
                // one starts right at the beginning of the slider.
                if(BaseHitObject.sliderReverses > 1)
                {
                    // Use the next segment
                    SegmentEndTime += SegmentLength;

                		for (var Time = SegmentEndTime - SegmentLength + LAZY_SLIDER_STEP_LENGTH; Time < SegmentEndTime; Time += LAZY_SLIDER_STEP_LENGTH)
                		{
                		    //Vector2 Difference = BaseHitObject.PositionAtTime(Time) - CursorPos;
                		    var Pat = getSliderPAT(BaseHitObject,Time);
                		    var DifferenceX = Pat[0] - CursorPosX;
                		    var DifferenceY = Pat[1] - CursorPosY;
                		    var Distance = distance(CursorPosX,CursorPosY,Pat[0],Pat[1]);
                		
                		    // Did we move away too far?
                		    if (Distance > SliderFollowCircleRadius)
                		    {
                		        // Yep, we need to move the cursor
                		        DifferenceX /= Distance; 
                		        DifferenceY /= Distance; // Obtain the direction of difference. We do no longer need the actual difference
                		        Distance -= SliderFollowCircleRadius;
                		        CursorPosX += DifferenceX * Distance;
                		        CursorPosY += DifferenceY * Distance; // We move the cursor just as far as needed to stay in the follow circle
                		        LazySliderLengthSubsequent += Distance;
                		    }
                		}

                    LazySliderLengthSubsequent *= ScalingFactor;
                    // If we have an even amount of repetitions the current position will be the end of the slider
                    if (BaseHitObject.sliderReverses % 2 == 1)
                    {
                        NormalizedEndPositionX = CursorPosX * ScalingFactor;
                        NormalizedEndPositionY = CursorPosY * ScalingFactor;
                    }
                }
            }
            // We have a normal HitCircle or a spinner
            else
            {
                NormalizedEndPositionX = BaseHitObject.x * ScalingFactor;
                NormalizedEndPositionY = BaseHitObject.y * ScalingFactor;
            }
            //...to prevent potential problems
						this.LazySliderLengthFirst = LazySliderLengthFirst;
						this.LazySliderLengthSubsequent = LazySliderLengthSubsequent;
						this.Strains = Strains;
						this.NormalizedStartPositionX = Math.round(NormalizedStartPositionX);
						this.NormalizedStartPositionY = Math.round(NormalizedStartPositionY);
						this.NormalizedEndPositionX = Math.round(NormalizedEndPositionX);
						this.NormalizedEndPositionY = Math.round(NormalizedEndPositionY);
        		this.CalculateStrains = function(PreviousHitObject)
        		{
        		    this.CalculateSpecificStrain(PreviousHitObject, 'Speed');
        		    this.CalculateSpecificStrain(PreviousHitObject, 'Aim');
        		};
						this.CalculateSpecificStrain = function(PreviousHitObject, tpType) // previous is tpHitobject
        		{
        		    var Addition = 0;
        		    var TimeElapsed = BaseHitObject.time - PreviousHitObject.BaseHitObject.time;
        		    var Decay = Math.pow(DECAY_BASE[tpType], TimeElapsed / 1000);
        		
        		    if (BaseHitObject.type & 8)
        		    {
        		        // Do nothing for spinners
        		    }
        		    else if (BaseHitObject.type & 2)
        		    {
        		        switch(tpType)
        		        {
        		            case 'Speed':
        		
        		                // For speed strain we treat the whole slider as a single spacing entity, since "Speed" is about how hard it is to click buttons fast.
        		                // The spacing weight exists to differentiate between being able to easily alternate or having to single.
        		                Addition =
        		                    this.SpacingWeight(PreviousHitObject.LazySliderLengthFirst +
        		                                  PreviousHitObject.LazySliderLengthSubsequent * (PreviousHitObject.BaseHitObject.sliderReverses - 1) +
        		                                  this.DistanceTo(PreviousHitObject), tpType) *
        		                    SPACING_WEIGHT_SCALING[tpType];
        		                break;
        		
        		
        		            case 'Aim':
        		
        		                // For Aim strain we treat each slider segment and the jump after the end of the slider as separate jumps, since movement-wise there is no difference
        		                // to multiple jumps.
        		                
        		                Addition = ( this.SpacingWeight(PreviousHitObject.LazySliderLengthFirst, tpType) +
        		                        this.SpacingWeight(PreviousHitObject.LazySliderLengthSubsequent, tpType) * ((PreviousHitObject.BaseHitObject.sliderReverses||1) - 1) +
        		                        this.SpacingWeight(this.DistanceTo(PreviousHitObject), tpType)
        		                    ) * SPACING_WEIGHT_SCALING[tpType];
        		                break;
        		        }
        		        
        		    }
        		    else if (BaseHitObject.type & 1)
        		    {
        		        Addition = this.SpacingWeight(this.DistanceTo(PreviousHitObject), tpType) * SPACING_WEIGHT_SCALING[tpType];
        		    }
        		
        		    // Scale addition by the time, that elapsed. Filter out HitObjects that are too close to be played anyway to avoid crazy values by division through close to zero.
        		    // You will never find maps that require this amongst ranked maps.
        		    Addition /= Math.max(TimeElapsed, 50);
        		
        		    this.Strains[tpType] = PreviousHitObject.Strains[tpType] * Decay + Addition;
        		};
        		this.SpacingWeight = function(distance,tpType)
        		{
        		
        		    switch(tpType)
        		    {
        		        case 'Speed':
        		
        		            {
        		                var Weight;
        		
        		                if (distance > SINGLE_SPACING_TRESHOLD)
        		                {
        		                    Weight = 2.5;
        		                }
        		                else if (distance > STREAM_SPACING_TRESHOLD)
        		                {
        		                    Weight = 1.6 + 0.9 * (distance - STREAM_SPACING_TRESHOLD) / (SINGLE_SPACING_TRESHOLD - STREAM_SPACING_TRESHOLD);
        		                }
        		                else if (distance > ALMOST_DIAMETER)
        		                {
        		                    Weight = 1.2 + 0.4 * (distance - ALMOST_DIAMETER) / (STREAM_SPACING_TRESHOLD - ALMOST_DIAMETER);
        		                }
        		                else if (distance > ALMOST_DIAMETER / 2)
        		                {
        		                    Weight = 0.95 + 0.25 * (distance - (ALMOST_DIAMETER / 2)) / (ALMOST_DIAMETER / 2);
        		                }
        		                else
        		                {
        		                    Weight = 0.95;
        		                }
        		
        		                return Weight;
        		            }
        		
        		
        		        case 'Aim':
        		            return Math.pow(distance, 0.99);
        		
        		
        		            // Should never happen. 
        		        default:
        		            return 0;
        		    }
        		};
        		this.DistanceTo = function(other)
        		{
        		    // Scale the distance by circle size.
        		    return distance(NormalizedStartPositionX,NormalizedStartPositionY,other.NormalizedEndPositionX,other.NormalizedEndPositionY);
        		}
        }

        


        // Caution: The subjective values are strong with this one





      


}

var tpHitObjects = [];
function doTPCalc()
{
	var STAR_SCALING_FACTOR = 0.045;
  var EXTREME_SCALING_FACTOR = 0.5;
  var PLAYFIELD_WIDTH = 512;
  
  CircleRadius = (PLAYFIELD_WIDTH / 16.0) * (1.0 - 0.7 * (diffSettings.CS - 5.0) / 5.0);
  
  tpHitObjects = [];
  
  for(var i=0;i<hitObjectArray.length;i++)
  {
  	tpHitObjects.push(new TP.tpHitObject(hitObjectArray[i], CircleRadius));
  }
  if (CalculateStrainValues() == false)
  {
      output("Could not compute strain values. Aborting difficulty calculation.");
      return;
  }
  var SpeedDifficulty = CalculateDifficulty('Speed');
  var AimDifficulty = CalculateDifficulty('Aim');
  output("Speed difficulty: " + SpeedDifficulty[0] + " | Aim difficulty: " + AimDifficulty[0]);
	//SpeedStars = Math.round(0.067555467 * SpeedDifficulty - 30.77387998);
	//AimStars = Math.round(0.064338712 * AimDifficulty - 25.54647229);
  //output("Speed level: " + SpeedStars + " | Aim level: " + AimStars);
	//output("Speed stars: " + SpeedStars + " | Aim stars: " + AimStars);
  //var StarRating = SpeedStars + AimStars + Math.abs(SpeedStars - AimStars) * EXTREME_SCALING_FACTOR;
	//output("Total star rating: " + StarRating);
  output("Max Speed: " + SpeedDifficulty[1]);
  output("Max Aim: " + AimDifficulty[1]);
}

function CalculateStrainValues()
{
    // .. im not using enumerator
		var ptr = 0;
		
    if (tpHitObjects.length == 0)
    {
        output("Can not compute difficulty of empty beatmap.");
        return false;
    }

    var CurrentHitObject = tpHitObjects[ptr];
    var NextHitObject;

    // First hitObject starts at strain 1. 1 is the default for strain values, so we don't need to set it here. See tpHitObject.

    while (ptr < tpHitObjects.length)
    {
        NextHitObject = tpHitObjects[ptr];
        NextHitObject.CalculateStrains(CurrentHitObject);
        CurrentHitObject = NextHitObject;
				ptr++;
    }

    return true;
}

function genStrainlist()
{
	var z=[];
	for(var i in tpHitObjects)
	{
		z.push(tpHitObjects[i].Strains.Speed);
	}
	return z;
}

var STRAIN_STEP = 400;
var DECAY_WEIGHT = 0.9;

function CalculateDifficulty(tpType)
{
    // Find the highest strain value within each strain step
    var HighestStrains = [];
    var IntervalEndTime = STRAIN_STEP;
    var MaximumStrain = 0; // We need to keep track of the maximum strain in the current interval
		var hitObject;
		
    var PreviousHitObject = null;
    for(var i=0;i<tpHitObjects.length;i++)
    {
    	hitObject = tpHitObjects[i];
        // While we are beyond the current interval push the currently available maximum to our strain list
      while(hitObject.BaseHitObject.time > IntervalEndTime)
      {
          HighestStrains.push([MaximumStrain, hitObject.BaseHitObject.time]);

          // The maximum strain of the next interval is not zero by default! We need to take the last hitObject we encountered, take its strain and apply the decay
          // until the beginning of the next interval.
          if(PreviousHitObject == null)
          {
              MaximumStrain = 0;
          }
          else
          {
              var Decay = Math.pow(DECAY_BASE[tpType], (IntervalEndTime - PreviousHitObject.BaseHitObject.time) / 1000);
              MaximumStrain = PreviousHitObject.Strains[tpType] * Decay;
          }

          // Go to the next time interval
          IntervalEndTime += STRAIN_STEP;
      }

      // Obtain maximum strain
      if (hitObject.Strains[tpType] > MaximumStrain)
      {
          MaximumStrain = hitObject.Strains[tpType];
      }

      PreviousHitObject = hitObject;
    }

    // Build the weighted sum over the highest strains for each interval
    var Difficulty = 0;
    var Weight = 1;
    HighestStrains.sort(function(a,b){if(a[0]>b[0])return false;return true}); // Sort from highest to lowest strain.

    for(var i=0;i<HighestStrains.length;i++)
    {
        Difficulty += Weight * HighestStrains[i][0];
        Weight *= DECAY_WEIGHT;
    }

    return [Difficulty,[HighestStrains[0][1], HighestStrains[1][1], HighestStrains[2][1]]];
}

function testTP()
{
	doTPCalc();
}

remapSort();