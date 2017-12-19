var MF_STRING = 0x00000000;

function StringFormat() {
	var h_align = 0, v_align = 0, trimming = 0, flags = 0;
	switch (arguments.length)
	{
	// fall-thru
	case 4:
		flags = arguments[3];
	case 3:
		trimming = arguments[2];
	case 2:
		v_align = arguments[1];
	case 1:
		h_align = arguments[0];
		break;
	default:
		return 0;
	}
	return ((h_align << 28) | (v_align << 24) | (trimming << 20) | flags);
}

function RGBA(r, g, b, a) {
	return ((a << 24) | (r << 16) | (g << 8) | (b));
}

//------------------Button---------------------
function Button(x, y, w, h, normal, move, down, tip) {
	this.State = 0;
	this.Img = Array(normal, move, down);
	var r = x + w;
	var b = y + h;
	var tooltip = window.CreateTooltip();
	tooltip.Text = tip;

	function RepaintBtn() {
		window.RepaintRect(x, y, w, h);
	}

	this.Draw = function(gr, alpha) {
		this.Img[this.State] && gr.DrawImage(this.Img[this.State], x, y, w, h, 0, 0, w, h, 0, alpha);
	}

	this.ChangeImg = function(normal, move, down) {
		this.Img = Array(normal, move, down);
		RepaintBtn();
	}

	this.Tooltip = function(tip) {
		tooltip.Activate();
		tooltip.Text = tip;
	}

	this.SetOffset = function(_x, _y, p) {
		x = _x; y = _y;
		r = x + w;
		b = y + h;
		if (!p) RepaintBtn();
	}

	this.SetSize = function(_w, _h, p) {
		w = _w; h = _h;
		r = x + w;
		b = y + h;
		if (!p) RepaintBtn();
	}

	this.Move = function(_x, _y) {
		if (this.State==0) {
			if (_x>x && _x<r && _y>y && _y<b) {
				tooltip.Activate();
				this.State = 1;
				RepaintBtn();
				return true;
			}
		} else if (_x<x || _x>r || _y<y || _y>b) {
			this.Reset();
			return false;
		}
	}

	this.Down = function() {
		if (this.State==1) {
			this.State = 2;
			RepaintBtn();
			return true;
		} else return false;
	}

	this.Up = function() {
		if (this.State==2) {
			this.State = 1;
			RepaintBtn();
			return true;
		} else return false;
	}

	this.Reset = function() {
		this.State = 0;
		tooltip.Deactivate();
		RepaintBtn();
	}

	this.Kill = function() {
		tooltip.Dispose();
		normal.Dispose();
		move.Dispose();
		down.Dispose();
	}
}

//------------------Dragbar---------------------
function Dragbar(x, y, h) {
	this.Pos = 0;
	this.W = 0;
	var r = x + this.W;
	var b = y + h;
	var dragging = false;
	var tooltip = window.CreateTooltip();

	this.SetWidth = function(_w) {
		this.W = _w;
		r = x + _w;
	}

	this.Down = function(_x, _y, tip) {
		if (tip) {
			tooltip.Text = tip;
			tooltip.TrackPosition(_x+20, b+10);
		}
		if (_x>=x && _x<=r && _y>=y && _y<=b) {
			dragging = true;
			this.Pos = _x - x;
			window.Repaint();
			return true;
		}
		else return false;
	}

	this.Drag = function(_x, _y, tip, move) {
		if (dragging || move) {
			if (tip) {
				if (move && (_x<x || _x>r || _y<y || _y>b)) {
					tip = "";
				}
				if (tooltip.Text!=tip) {
					tooltip.Activate();
					tooltip.TrackActivate = true;
					tooltip.Text = tip;
					tooltip.TrackPosition(_x+20, b+10);
				}
			}
		}
		if (dragging) {
			if (_x>=x) {
				this.Pos = _x - x;
				if (_x>r) this.Pos = this.W;
			} else {
				this.Pos = 0;
			}
			window.Repaint();
			return true;
		}
		else return false;
	}

	this.WheelTip = function(tip) {
		tooltip.Activate();
		tooltip.TrackActivate = true;
		tooltip.Text = tip;
		tooltip.TrackPosition(0, b+20);
	}

	this.Reset = function() {
		tooltip.Deactivate();
		tooltip.TrackActivate = false;
		dragging = false;
	}
}

//------------------Anim---------------------
function FadeAnim(def) {
	var obj = this;
	obj.Count = def;
	obj.Fade = function(end, speed) {
		obj.Timer && window.ClearInterval(obj.Timer);
		obj.Timer = window.SetInterval(function() {
			if (obj.Count==end)
				window.ClearInterval(obj.Timer);
			else {
				obj.Count = (speed>0 && (obj.Count + speed)>end) || (speed<0 && (obj.Count + speed)<end) ? end : obj.Count + speed;
				window.Repaint();
			}
		},30);
	}
}

// wirtten by matif, changed many lines from anonymity's
