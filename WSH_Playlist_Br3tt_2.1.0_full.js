// ==PREPROCESSOR==
// @name "WSH Playlist Viewer"
// @version "2.1.0"
// @author "Br3tt aka Falstaff >> http://br3tt.deviantart.com"
// @feature "v1.4"
// @feature "watch-metadb"
// @feature "dragdrop"
// @import "%fb2k_path%skins\Mnlt2\ChineseTrans.js"
// ==/PREPROCESSOR==

// [Requirements]
// * foobar2000 v1.1 or better  >> http://foobar2000.org
// * WSH panel Mod v1.5.3.1 or better  >> http://code.google.com/p/foo-wsh-panel-mod/downloads/list
// * Optional: Font uni 05_53  >> http://www.dafont.com/uni-05-x.font
//    this font is required to display extra info in group header (codec + genre) and playcount info
// * Optional: Font guifx v2 transports  >> http://blog.guifx.com/2009/04/02/guifx-v2-transport-font
//    this font is required to get nice stars for the rating columns, but if not installed, it will works with standard star (*) character
// [/Requirements]

// [Installation]
// * import/paste this jscript into a WSH Panel Mod instance of your foobar2000 layout (DUI or CUI)
// [/Installation]

// [Informations]
// * Use Jscript9 engine (if supported by your system) for better performances
// * change colors and fonts in foobar2000 Preferences > DefaultUI or ColumsUI
// * Some Settings can be changed in window Properties (Properties from settings menu -> toolbar button)
// * double click on toolbar > Show Now Playing item
// * use keyboard to search artist in the playlist (incremental search feature)
// * matif added functions, translated, simple modify.
// * chinese data from mmdays.
// [/Informations]

//=================================================// General declarations
SM_CXVSCROLL = 2;
SM_CYHSCROLL = 3;
DLGC_WANTARROWS = 0x0001;
DLGC_WANTALLKEYS = 0x0004;
// }}
// Use with MenuManager() 
// {{
MF_STRING = 0x00000000;
MF_SEPARATOR = 0x00000800;
MF_GRAYED = 0x00000001;
MF_DISABLED = 0x00000002;
MF_POPUP = 0x00000010;
// }}
// Used in window.SetCursor()
// {{
IDC_ARROW = 32512;
IDC_IBEAM = 32513;
IDC_WAIT = 32514;
IDC_CROSS = 32515;
IDC_UPARROW = 32516;
IDC_SIZE = 32640;
IDC_ICON = 32641;
IDC_SIZENWSE = 32642;
IDC_SIZENESW = 32643;
IDC_SIZEWE = 32644;
IDC_SIZENS = 32645;
IDC_SIZEALL = 32646;
IDC_NO = 32648;
IDC_APPSTARTING = 32650;
IDC_HAND = 32649;
IDC_HELP = 32651;
// }}
// Use with GdiDrawText() 
// {{
var DT_LEFT = 0x00000000;
var DT_RIGHT = 0x00000002;
var DT_TOP = 0x00000000;
var DT_CENTER = 0x00000001;
var DT_VCENTER = 0x00000004;
var DT_WORDBREAK = 0x00000010;
var DT_SINGLELINE = 0x00000020;
var DT_CALCRECT = 0x00000400;
var DT_NOPREFIX = 0x00000800;
var DT_EDITCONTROL = 0x00002000;
var DT_END_ELLIPSIS = 0x00008000;
// }}
// Keyboard Flags & Tools
// {{
var VK_BACK = 0x08;
var VK_RETURN = 0x0D;
var VK_SHIFT = 0x10;
var VK_CONTROL = 0x11;
var VK_ALT = 0x12;
var VK_ESCAPE = 0x1B;
var VK_PGUP = 0x21;
var VK_PGDN = 0x22;
var VK_END = 0x23;
var VK_HOME = 0x24;
var VK_LEFT = 0x25;
var VK_UP = 0x26;
var VK_RIGHT = 0x27;
var VK_DOWN = 0x28;
var VK_INSERT = 0x2D;
var VK_DELETE = 0x2E;
var VK_SPACEBAR = 0x20;
var KMask = {
    none: 0,
    ctrl: 1,
    shift: 2,
    ctrlshift: 3,
    ctrlalt: 4,
    ctrlaltshift: 5,
    alt: 6
};
function GetKeyboardMask() {
    var c = utils.IsKeyPressed(VK_CONTROL) ? true : false;
    var a = utils.IsKeyPressed(VK_ALT) ? true : false;
    var s = utils.IsKeyPressed(VK_SHIFT) ? true : false;
    var ret = KMask.none;
    if (c && !a && !s) ret = KMask.ctrl;
    if (!c && !a && s) ret = KMask.shift;
    if (c && !a && s) ret = KMask.ctrlshift;
    if (c && a && !s) ret = KMask.ctrlalt;
    if (c && a && s) ret = KMask.ctrlaltshift;
    if (!c && a && !s) ret = KMask.alt;
    return ret;
};
// }}
// {{
// Used in window.GetColorCUI()
ColorTypeCUI = {
    text: 0,
    selection_text: 1,
    inactive_selection_text: 2,
    background: 3,
    selection_background: 4,
    inactive_selection_background: 5,
    active_item_frame: 6
};
// Used in window.GetFontCUI()
FontTypeCUI = {
    items: 0,
    labels: 1
};
// Used in window.GetColorDUI()
ColorTypeDUI = {
    text: 0,
    background: 1,
    highlight: 2,
    selection: 3
};
// Used in window.GetFontDUI()
FontTypeDUI = {
    defaults: 0,
    tabs: 1,
    lists: 2,
    playlists: 3,
    statusbar: 4,
    console: 5
};
//}}
// {{
// Used in gr.DrawString()
function StringFormat() {
    var h_align = 0,
    v_align = 0,
    trimming = 0,
    flags = 0;
    switch (arguments.length) {
        case 3:
        trimming = arguments[2];
        case 2:
        v_align = arguments[1];
        case 1:
        h_align = arguments[0];
        break;
        default:
        return 0;
    };
    return ((h_align << 28) | (v_align << 24) | (trimming << 20) | flags);
};
StringAlignment = {
    Near: 0,
    Centre: 1,
    Far: 2
};
var lt_stringformat = StringFormat(StringAlignment.Near, StringAlignment.Near);
var ct_stringformat = StringFormat(StringAlignment.Centre, StringAlignment.Near);
var rt_stringformat = StringFormat(StringAlignment.Far, StringAlignment.Near);
var lc_stringformat = StringFormat(StringAlignment.Near, StringAlignment.Centre);
var cc_stringformat = StringFormat(StringAlignment.Centre, StringAlignment.Centre);
var rc_stringformat = StringFormat(StringAlignment.Far, StringAlignment.Centre);
var lb_stringformat = StringFormat(StringAlignment.Near, StringAlignment.Far);
var cb_stringformat = StringFormat(StringAlignment.Centre, StringAlignment.Far);
var rb_stringformat = StringFormat(StringAlignment.Far, StringAlignment.Far);
//}}
// {{
// Used in utils.GetAlbumArt()
AlbumArtId = {
	front: 0,
	back: 1,
	disc: 2,
	icon: 3,
	artist: 4
};
//}}
// {{
// Used everywhere!
function RGB(r, g, b) {
    return (0xff000000 | (r << 16) | (g << 8) | (b));
};
function RGBA(r, g, b, a) {
    return ((a << 24) | (r << 16) | (g << 8) | (b));
};
function getAlpha(color) {
    return ((color >> 24) & 0xff);
}

function getRed(color) {
    return ((color >> 16) & 0xff);
}

function getGreen(color) {
    return ((color >> 8) & 0xff);
}

function getBlue(color) {
    return (color & 0xff);
}
function num(strg, nb) {
    var i;
    var str = strg.toString();
    var k = nb - str.length;
    if (k > 0) {
        for (i=0;i<k;i++) {
            str = "0" + str;
        };
    };
    return str.toString();
};
//Time formatting secondes -> 0:00
function TimeFromSeconds(t){
    var zpad = function(n){
    var str = n.toString();
        return (str.length<2) ? "0"+str : str;
    };
    var h = Math.floor(t/3600); t-=h*3600;
    var m = Math.floor(t/60); t-=m*60;
    var s = Math.floor(t);
    if(h>0) return h.toString()+":"+zpad(m)+":"+zpad(s);
    return m.toString()+":"+zpad(s);
};
function TrackType(trkpath) {
    var taggable;
    var type;
    switch (trkpath) {
        case "file":
        taggable = 1;
        type = 0;
        break;
        case "cdda":
        taggable = 1;
        type = 1;
        break;
        case "FOO_":
        taggable = 0;
        type = 2;
        break;
        case "http":
        taggable = 0;
        type = 3;
        break;
        case "mms:":
        taggable = 0;
        type = 3;
        break;
        case "unpa":
        taggable = 0;
        type = 4;
        break;
        default:
        taggable = 0;
        type = 5;
    };
    return type;
};
function replaceAll(str, search, repl) {
    while (str.indexOf(search) != -1) {
        str = str.replace(search, repl);
    };
    return str;
};
function removeAccents(str) {
    /*
    var norm = new Array('À','Á','Â','Ã','Ä','Å','Æ','Ç','È','É','Ê','Ë',
    'Ì','Í','Î','Ï', 'Ð','Ñ','Ò','Ó','Ô','Õ','Ö','Ø','Ù','Ú','Û','Ü','Ý',
    'Þ','ß');
    var spec = new Array('A','A','A','A','A','A','AE','C','E','E','E','E',
    'I','I','I','I', 'D','N','O','O','O','O','O','O','U','U','U','U','Y',
    'b','SS');
    for (var i = 0; i < spec.length; i++) {
        str = replaceAll(str, norm[i], spec[i]);
    };
    */
    return str;
};
//}}

//=================================================// Button object
ButtonStates = {normal: 0, hover: 1, down: 2};
button = function (normal, hover, down) {
    this.img = Array(normal, hover, down);
    this.w = this.img[0].Width;
    this.h = this.img[0].Height;
    this.state = ButtonStates.normal;
    this.update = function (normal, hover, down) {
        this.img = Array(normal, hover, down);
    };
    this.draw = function (gr, x, y, alpha) {
        this.x = x;
        this.y = y;
        this.img[this.state] && gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h, 0, alpha);
    };
    this.display_context_menu = function (x, y, id) {};
    this.repaint = function () {
        window.RepaintRect(this.x, this.y, this.w, this.h);
    };
    this.checkstate = function (event, x, y) {
        this.ishover = (x > this.x && x < this.x + this.w - 1 && y > this.y && y < this.y + this.h - 1);
        this.old = this.state;
        switch (event) {
         case "down":
            switch(this.state) {
             case ButtonStates.normal:
             case ButtonStates.hover:
                this.state = this.ishover ? ButtonStates.down : ButtonStates.normal;
                break;
            };
            break;
         case "up":
            this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
            break;
         case "right":
             if(this.ishover) this.display_context_menu(x, y, id);
             break;
         case "move":
            switch(this.state) {
             case ButtonStates.normal:
             case ButtonStates.hover:
                this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
                break;
            };
            break;
         case "leave":
            this.state = this.isdown ? ButtonStates.down : ButtonStates.normal;
            break;
        };
        if(this.state!=this.old) this.repaint();
        return this.state;
    };
};

//=================================================// Tools (general)
function get_system_scrollbar_width() {
    var tmp = utils.GetSystemMetrics(SM_CXVSCROLL);
    return tmp;
};

function get_system_scrollbar_height() {
    var tmp = utils.GetSystemMetrics(SM_CYHSCROLL);
    return tmp;
};

String.prototype.repeat = function(num) {
    if(num>=0 && num<=5) {
        var g = Math.round(num);
    } else {
        return "";
    };
    return new Array(g+1).join(this);
};

function getTimestamp() {
    var d, s1, s2, s3, hh, min, sec, timestamp;
    d = new Date();
    s1 = d.getFullYear();
    s2 = (d.getMonth() + 1);
    s3 = d.getDate();
    hh = d.getHours();
    min = d.getMinutes();
    sec = d.getSeconds();
    if(s3.length == 1) s3 = "0" + s3;
    timestamp = s1 + ((s2 < 10) ? "-0" : "-") + s2 + ((s3 < 10) ? "-0" : "-" ) + s3 + ((hh < 10) ? " 0" : " ") + hh + ((min < 10) ? ":0" : ":") + min + ((sec < 10) ? ":0" : ":") + sec;
    return timestamp;
};

//=================================================// Sort pattern used in this panel
var sort_pattern_album = window.GetProperty("系統|排序模式|專輯", "%album artist%|$if(%album%,$if2(%date%,9999),0000)|%album%|%discnumber%|%tracknumber%");
var sort_pattern_artist = window.GetProperty("系統|排序模式|歌手", "%artist%|$if(%album%,$if2(%date%,9999),0000)|%album%|%discnumber%|%tracknumber%");
var sort_pattern_path = window.GetProperty("系統|排序模式|路徑", "%path%");
var sort_pattern_date = window.GetProperty("系統|排序模式|日期", "%date%");
var sort_pattern_genre = window.GetProperty("系統|排序模式|類型", "%genre%");
var sort_pattern_title = window.GetProperty("系統|排序模式|標題", "%title%");
var sort_pattern_tracknumber = window.GetProperty("系統|排序模式|曲目", "%tracknumber%");
var sort_pattern_length = window.GetProperty("系統|排序模式|曲長", "%length%");
var sort_pattern_bitrate = window.GetProperty("系統|排序模式|速率", "%bitrate%");
var sort_pattern_rating = window.GetProperty("系統|排序模式|評等", "%rating%");

//=================================================// Group pattern used in this panel
var group_pattern_album = window.GetProperty("系統|群組模式|專輯", "%album artist%%album%%discnumber%");
var group_pattern_artist = window.GetProperty("系統|群組模式|歌手", "%artist%");
var group_pattern_path = window.GetProperty("系統|群組模式|路徑", "%directory%");

//=================================================// Image declarations
var playicon_off;
var playicon_on;
var nocover;
var nocover_img;
var noartist;
var noartist_img;
var streamcover;
var streamcover_img;
var glass_reflect_img;
var icon_arrow_left;
var singleline_group_header_icon;
var bt_settings_off;
var bt_settings_ov;
var bt_settings_on;
var bt_sort_off;
var bt_sort_ov;
var bt_sort_on;

function on_get_album_art_done(metadb, art_id, image, image_path) {
    var draw_limit = list.tocut+list.nbvis+group.nbrows+1;
    if(draw_limit>list.item.length) draw_limit = list.item.length;
    for(var i=list.tocut;i<draw_limit;i++) {
        if(list.item[i].metadb && list.item[i].gridx==group.nbrows) {
            if(list.item[i].metadb.Compare(metadb)) {
                list.item[i].cover_img = g_image_cache.getit(list.item[i], image);
                var cx = list.item[i].x + cover.margin;
                var cy = list.item[i].y - ((group.nbrows-1)*row.h);
                cx = cover.margin;
                cy = list.item[i].y - ((group.nbrows-1)*row.h);
                // fix for a weird behaviour with engine Jscript9
                if(!cx) cx = 2; else if(cx<2) cx = 2;
                if(!cy) cy = 2; else if(cy<2) cy = 2;
                window.RepaintRect(cx-2, cy-2, group.nbrows*row.h, group.nbrows*row.h);
                break;
            };
        };
    };
};

//=================================================// Cover Tools
image_cache = function () {
    this._cachelist = {};
    this.hit = function (item) {
        var img = this._cachelist[item.metadb.Path];
        if (typeof img == "undefined") {
            if(!cover.load_timer) {
                cover.load_timer = window.SetTimeout(function() {
                    switch(group.type){
                        case 0:
                            var art_id = AlbumArtId.front;
                            break;
                        case 1:
                            var art_id = AlbumArtId.artist;
                            break;
                        case 2:
                            var art_id = AlbumArtId.front;
                            break;
                    };
                    utils.GetAlbumArtAsync(window.ID, item.metadb, art_id, true, false, false);
                    cover.load_timer && window.ClearTimeout(cover.load_timer);
                    cover.load_timer = false;
                }, 35);
            };
        };
        return img;
    };
    this.getit = function (item, image, image_path) {
        var img;
        if(cover.keepaspectratio) {
            if(!image) {
                var pw = (cover.w-cover.margin*2);
                var ph = (cover.h-cover.margin*2);
            } else {
                if(image.Height>=image.Width) {
                    var ratio = image.Width / image.Height;
                    var pw = (cover.w-cover.margin*2)*ratio;
                    var ph = (cover.h-cover.margin*2);
                } else {
                    var ratio = image.Height / image.Width;
                    var pw = (cover.w-cover.margin*2);
                    var ph = (cover.h-cover.margin*2)*ratio;
                };
            };
        } else {
            var pw = cover.w-cover.margin*2;
            var ph = cover.h-cover.margin*2;
        };
        // item.cover_type : 0 = nocover, 1 = external cover, 2 = embedded cover, 3 = stream
        if(item.track_type!=3) {
            if(item.metadb) {
                img = FormatCover(image, pw, ph);
                if(!img) {
                    img = (group.type==1)?noartist_img:nocover_img;
                    item.cover_type = 0;
                } else {
                    item.cover_type = 1;
                };
            };
        } else {
            img = streamcover_img;
            item.cover_type = 3;
        };   
        this._cachelist[item.metadb.Path] = img;
        return img;
    };
};
var g_image_cache = new image_cache;

function FormatCover(image, w, h) {
	if(!image || w<=0 || h<=0) return image;
    if(cover.draw_glass_effect) {
        var new_img = image.Resize(w, h, 2);
        var gb = new_img.GetGraphics();
        if(h>w) {
            gb.DrawImage(glass_reflect_img, Math.floor((h-w)/2)*-1+1, 1, h-2, h-2, 0, 0, glass_reflect_img.Width, glass_reflect_img.Height, 0, 150);
        } else {
            gb.DrawImage(glass_reflect_img, 1, Math.floor((w-h)/2)*-1+1, w-2, w-2, 0, 0, glass_reflect_img.Width, glass_reflect_img.Height, 0, 150);
        };
        new_img.ReleaseGraphics(gb);
        return new_img;
    } else {
        return image.Resize(w, h, 2);
    };
};

function FormatWP(image, w, h) {
	if(!image || w<=0 || h<=0) return image;
    return image.Resize(w, h, 2);
};

function draw_glass_reflect(w, h) {
    // Mask for glass effect
    var Mask_img = gdi.CreateImage(w, h);
    var gb = Mask_img.GetGraphics();
    gb.FillSolidRect(0,0,w,h,0xffffffff);
    gb.FillGradRect(0,0,w-20,h,0,0xaa000000,0,1.0);
    gb.SetSmoothingMode(2);
    gb.FillEllipse(-20, 25, w*2+40, h*2, 0xffffffff);
    Mask_img.ReleaseGraphics(gb);
    // drawing the white rect
    var glass_img = gdi.CreateImage(w, h);
    gb = glass_img.GetGraphics();
    gb.FillSolidRect(0, 0, w, h, 0xffffffff);
    glass_img.ReleaseGraphics(gb);
    // resizing and applying the mask
    var Mask = Mask_img.Resize(w, h);
    glass_img.ApplyMask(Mask);
    Mask.Dispose();
    return glass_img;
};

function reset_cover_timers() {
    cover.load_timer && window.ClearTimeout(cover.load_timer);
    cover.load_timer = false;
};

function repaint_rating(ry) {
    if(!columns.rating_timerID) {
        //columns.rating_timerID = window.SetTimeout(function() {
            window.RepaintRect(columns.rating_x, ry, columns.rating_w, row.h);
            columns.rating_timerID && window.ClearTimeout(columns.rating_timerID);
            columns.rating_timerID = false;
        //},50);
    };
};

function repaint_mood(ry) {
    if(!columns.mood_timerID) {
        //columns.mood_timerID = window.SetTimeout(function() {
            window.RepaintRect(columns.mood_x, ry, columns.mood_w, row.h);
            columns.mood_timerID && window.ClearTimeout(columns.mood_timerID);
            columns.mood_timerID = false;
        //},25);
    };
};

//=================================================// Item Object
ItemStates = {normal: 0, hover: 1, selected: 2};
item = function (id, idx, gridx) {
    if (typeof this.id == "undefined") {
        this.id = id;
        this.idx = idx;
        this.gridx = gridx;
        this.grp_idx = 0;
        this.metadb = list.handlelist.Item(this.id);
        this.x = 0;
        this.defaulty = toolbar.h + (idx) * row.h;
        this.w = ww;
        this.h = row.h;
        this.l_rating = 0;
        this.l_mood = 0;
        this.tooltip = false;
        if(this.metadb) {
            this.albumartist = tf_albumartist.EvalWithMetadb(this.metadb);
            this.album = tf_album.EvalWithMetadb(this.metadb);
            this.group_key = tf_group_key.EvalWithMetadb(this.metadb);
            this.track_type = TrackType(this.metadb.rawpath.substring(0,4));
            if(this.gridx==0) {
                this.tracknumber = tf_tracknumber.EvalWithMetadb(this.metadb);
                this.artist = tf_artist.EvalWithMetadb(this.metadb);
                var info = this.metadb.GetFileInfo();
                this.title = info.MetaValue(info.MetaFind("TITLE"), 0) ? tf_titleO.EvalWithMetadb(this.metadb) : tf_title.EvalWithMetadb(this.metadb);
                this.playcount = columns.playcount ? tf_playcount.EvalWithMetadb(this.metadb) : 0;
                this.duration = tf_duration.EvalWithMetadb(this.metadb);
                this.mood = columns.mood ? tf_mood.EvalWithMetadb(this.metadb) : 0;
                this.rating = columns.rating ? tf_rating.EvalWithMetadb(this.metadb) : 0;
                this.bitrate = columns.bitrate ? tf_bitrate.EvalWithMetadb(this.metadb) : "";
            } else {
                this.genre = tf_genre.EvalWithMetadb(this.metadb);
                this.date = tf_date.EvalWithMetadb(this.metadb);
                this.codec = tf_codec.EvalWithMetadb(this.metadb);
                this.disc_info = tf_disc_info.EvalWithMetadb(this.metadb);
            };
        };
    };


    this.update_infos = function() {
        if(this.metadb) {
            this.albumartist = tf_albumartist.EvalWithMetadb(this.metadb);
            this.album = tf_album.EvalWithMetadb(this.metadb);
            this.group_key = tf_group_key.EvalWithMetadb(this.metadb);
            this.track_type = TrackType(this.metadb.rawpath.substring(0,4));
            if(this.gridx==0) {
                this.tracknumber = tf_tracknumber.EvalWithMetadb(this.metadb);
                this.artist = tf_artist.EvalWithMetadb(this.metadb);
                var info = this.metadb.GetFileInfo();
                this.title = info.MetaValue(info.MetaFind("TITLE"), 0) ? tf_titleO.EvalWithMetadb(this.metadb) : tf_title.EvalWithMetadb(this.metadb);
                this.playcount = tf_playcount.EvalWithMetadb(this.metadb);
                this.duration = tf_duration.EvalWithMetadb(this.metadb);
                this.mood = columns.mood ? tf_mood.EvalWithMetadb(this.metadb) : 0;
                this.rating = columns.rating ? tf_rating.EvalWithMetadb(this.metadb) : 0;
                this.bitrate = columns.bitrate ? tf_bitrate.EvalWithMetadb(this.metadb) : "";
            } else {
                this.genre = tf_genre.EvalWithMetadb(this.metadb);
                this.date = tf_date.EvalWithMetadb(this.metadb);
                this.codec = tf_codec.EvalWithMetadb(this.metadb);
                this.disc_info = tf_disc_info.EvalWithMetadb(this.metadb);
            };
        };
    };


    this.draw = function(gr, id, idx) {
        this.y = this.defaulty - (list.tocut * row.h);
        if(this.gridx==0) {
            // ---------------------
            // ::: Draw item
            // ---------------------
            if(list.focus_id==this.id) {
                // focused item bg
                var state = 2;
                try {
                    list.theme.SetPartAndStateId(6, 10);
                    list.theme.DrawThemeBackground(gr, this.x, this.y, ww-vscrollbar.w, this.h);
                } catch(e) {
                    gr.SetSmoothingMode(2);
                    //gr.DrawRect(this.x+0, this.y, this.w-vscrollbar.w-1, this.h-1, 3.0, g_textcolor_hl);
                    gr.DrawRoundRect(this.x+0, this.y, this.w-vscrollbar.w-1, this.h-1, 2, 2, 1.0, g_textcolor_hl&0x30ffffff);
                    //gr.FillGradRect(this.x, this.y, this.w-vscrollbar.w-1, this.h-1, 90, g_textcolor_hl&0x35ffffff, g_textcolor_hl&0x15ffffff, 1.0);
                    gr.FillSolidRect(this.x, this.y, this.w-vscrollbar.w-1, this.h-1, g_textcolor_hl&0x25ffffff);
                    gr.SetSmoothingMode(0);
                };
            } else {
                if(plman.IsPlaylistItemSelected(plman.ActivePlaylist, this.id)) {
                    // selected item bg
                    var state = 1;
                    try {
                        list.theme.SetPartAndStateId(6, 10);
                        list.theme.DrawThemeBackground(gr, this.x, this.y, ww-vscrollbar.w, this.h);
                    } catch(e) {
                        gr.SetSmoothingMode(2);
                        //gr.DrawRect(this.x+0, this.y, this.w-vscrollbar.w-1, this.h-1, 3.0, g_textcolor_hl);
                        gr.DrawRoundRect(this.x+0, this.y, this.w-vscrollbar.w-1, this.h-1, 2, 2, 1.0, g_textcolor_hl&0x30ffffff);
                        //gr.FillGradRect(this.x, this.y, this.w-vscrollbar.w-1, this.h-1, 90, g_textcolor_hl&0x35ffffff, g_textcolor_hl&0x15ffffff, 1.0);
                        gr.FillSolidRect(this.x, this.y, this.w-vscrollbar.w-1, this.h-1, g_textcolor_hl&0x25ffffff);
                        gr.SetSmoothingMode(0);
                    };
                } else {
                    // default item bg (odd/even)
                    var state = 0;
                    if(Math.floor(this.grp_idx/2) == this.grp_idx/2) {
                        gr.FillSolidRect(this.x, this.y, this.w-vscrollbar.w, this.h, RGBA(255,255,255,5));
                    } else {
                        gr.FillSolidRect(this.x, this.y, this.w-vscrollbar.w, this.h, RGBA(0,0,0,5));
                    };
                    if(list.gradient_lines_show) {
                        gr.FillGradRect(this.x+30, this.y, this.w-vscrollbar.w-60, 1, 0, 0, RGBA(0,0,0,80), 0.5);
                        gr.FillGradRect(this.x+30, this.y+1, this.w-vscrollbar.w-60, 1, 0, 0, RGBA(255,255,255,15), 0.5);
                    };
                };
            };
            
            // last item shadow effect
            if(this.id==list.total-1) {
                gr.FillSolidRect(this.x, this.y+this.h+0, this.w-vscrollbar.w, 1, RGBA(0,0,0,75));
                gr.FillSolidRect(this.x, this.y+this.h+1, this.w-vscrollbar.w, 1, RGBA(0,0,0,35));
                gr.FillSolidRect(this.x, this.y+this.h+2, this.w-vscrollbar.w, 1, RGBA(0,0,0,12));
            };
            
            // ****************************
            // .start. *** cols metrics ***
            // ****************************
            columns.playicon_x = 0;
            if(columns.playicon) {
                columns.playicon_w = (cover.margin + 20);
            } else {
                columns.playicon_w = 3;
            };
            //
            columns.tracknumber_x = columns.playicon_x + columns.playicon_w;
            if(columns.tracknumber) {
                columns.tracknumber_w = 36;
            } else {
                columns.tracknumber_w = 5;
            };
            //
            if(columns.rating || columns.bitrate || columns.mood) {
                if(columns.duration_w<=0) {
                    columns.duration_w = gr.CalcTextWidth("00:00:00", g_font);
                };
            } else {
                columns.duration_w = gr.CalcTextWidth(" -"+this.duration, g_font);
            };
            //
            columns.duration_x = ww-vscrollbar.w - columns.duration_w - cover.margin;
            //
            if(columns.rating_w<=0) {
                if(g_font_guifx_found) {
                    columns.rating_w = gr.CalcTextWidth("bbbbb", rating_font);
                } else {
                    columns.rating_w = 66;
                };
            };
            columns.rating_x = columns.duration_x - (columns.rating_w*columns.rating);
            //
            if(columns.mood_w<=0) {
                if(g_font_guifx_found) {
                    columns.mood_w = gr.CalcTextWidth("v", mood_font) + 3;
                } else {
                    columns.mood_w = gr.CalcTextWidth("♥", mood_font) + 3;
                };
            };
            columns.mood_x = columns.rating_x - (columns.mood_w*columns.mood);
            //
            if(columns.bitrate_w<=0) {
                columns.bitrate_w = gr.CalcTextWidth("XXXXXXX", g_font)*columns.bitrate;
            };
            columns.bitrate_x = columns.mood_x - (columns.bitrate_w*columns.bitrate);
            //
            if(columns.playcount && this.playcount>0) {
                var playcount_w = gr.CalcTextWidth(this.playcount, mini_font)+3;
            } else {
                var playcount_w = 0;
            };
            //
            columns.title_x = columns.tracknumber_x + columns.tracknumber_w;
            columns.title_w = (columns.rating_x - columns.title_x - 3 - playcount_w) - (columns.bitrate_w*columns.bitrate) - (columns.mood_w*columns.mood);
            // **************************
            // .end. *** cols metrics ***
            // **************************
            
            row.parity = (row.h/2==Math.floor(row.h))?1:0;
            
            // now playing info : Play icon + Progress bar
            var duration = this.duration;
            var bitrate = this.bitrate;
            if(plman.PlayingPlaylist == plman.ActivePlaylist) {
                if(fb.IsPlaying) {
                    list.nowplaying = plman.GetPlayingItemLocation();
                    if(this.id==list.nowplaying.PlaylistItemIndex) {
                        var isplaying = true;
                        g_playing_item_y = this.y;
                        // progress bar (if not a stream!)
                        if(this.track_type!=3 && row.show_progress && fb.PlaybackLength) {
                            var length_seconds = tf_length_seconds.EvalWithMetadb(this.metadb);
                            var progress = Math.round(g_seconds / length_seconds * (ww-vscrollbar.w-this.x-0));
                            gr.FillGradRect(this.x+0, this.y, progress, this.h, 90, g_textcolor_sel&0x50ffffff, 0, 0.5);
                        };
                        // calc dynamic other tf values
                        duration = tf_playback_time_remaining.Eval(true);
                        bitrate = tf_bitrate_playing.Eval(true);
                        if(columns.playicon) {
                            if(g_seconds/2==Math.floor(g_seconds/2)) {
                                gr.DrawImage(playicon_off, columns.playicon_x+9, this.y, playicon_off.Width, playicon_off.Height, 0, 0, playicon_off.Width, playicon_off.Height, 0, 255);
                            } else {
                                gr.DrawImage(playicon_on, columns.playicon_x+9, this.y, playicon_off.Width, playicon_off.Height, 0, 0, playicon_off.Width, playicon_off.Height, 0, 255);
                            };
                        };
                    } else {
                        var isplaying = false;
                    };
                };
            };
            // draw tracknumber
            if(columns.tracknumber) {
                if(plman.IsPlaybackQueueActive()) {
                    var queue_index = plman.FindPlaybackQueueItemIndex(this.metadb, plman.ActivePlaylist, this.id);
                };
                //gr.FillGradRect(columns.tracknumber_x+3, this.y+3, columns.tracknumber_w-7, this.h-6, 90, g_backcolor&0x15ffffff, g_textcolor&0x15ffffff, 1.0);
                //gr.DrawRect(columns.tracknumber_x+3, this.y+3, columns.tracknumber_w-8, this.h-7, 1.0, g_textcolor&0x10ffffff);
                gr.SetSmoothingMode(2);
                gr.FillRoundRect(columns.tracknumber_x+3, this.y+4, columns.tracknumber_w-9, this.h-9, 2, 2, isplaying?g_textcolor_sel:g_textcolor);
                gr.SetSmoothingMode(0);
                //var new_tracknumber = (this.tracknumber>0)? this.tracknumber : (group.nbrows>0?num(this.grp_idx+1,2):"?");
                var new_tracknumber = (queue_index>=0) ? " " + num(queue_index+1,2) + "*" : ((this.tracknumber>0)? this.tracknumber : num(this.grp_idx+1,2));
                gr.GdiDrawText(new_tracknumber, gdi.Font("tahoma", 10), (queue_index>=0 || isQueuePlaylistActive())?RGB(100,180,100):g_backcolor, columns.tracknumber_x, this.y, columns.tracknumber_w-1, this.h-row.parity, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
            };

            // draw title
            try {
                tf_title_w = gr.CalcTextWidth(this.title, g_font);
                if(tf_title_w > columns.title_w) {
                    tf_title_w = columns.title_w;
                    this.tooltip = true;
                } else {
                    //if tag changed
                    this.tooltip = false;
                };
                gr.GdiDrawText(this.title, g_font, isplaying?g_textcolor_sel:g_textcolor, columns.title_x, this.y, columns.title_w, this.h-row.parity, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
            } catch(e) {
                tf_title_w = gr.CalcTextWidth(this.title, gdi.Font("tahoma", 11));
                if(tf_title_w > columns.title_w) {
                    tf_title_w = columns.title_w;
                    this.tooltip = true;
                } else {
                    this.tooltip = false;
                };
                gr.GdiDrawText(this.title, gdi.Font("tahoma", 11), isplaying?g_textcolor_sel:g_textcolor, columns.title_x, this.y, columns.title_w, this.h-row.parity, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
            };
            
            // draw artist
            if (this.artist && (group.nbrows==0 || (columns.title==1 && this.artist!=this.albumartist) || columns.title==2)) {
                var artist_x = columns.title_x + tf_title_w;
                try {
                    var artist_w = columns.title_w - tf_title_w;
                    tf_artist_w = gr.CalcTextWidth(" "+panel.tag_separator+" "+this.artist, g_font);
                    if(tf_artist_w > artist_w) {
                        tf_artist_w = artist_w;
                        this.tooltip = true;
                    } else {
                        this.tooltip = false;
                    };
                    if(tf_title_w < columns.title_w) {
                        gr.GdiDrawText(" "+panel.tag_separator+" "+this.artist, g_font, g_textcolor_hl, artist_x, this.y, artist_w, this.h-row.parity, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                    };
                } catch(e) {
                    var artist_w = columns.title_w - tf_title_w;
                    tf_artist_w = gr.CalcTextWidth(" "+panel.tag_separator+" "+this.artist, gdi.Font("tahoma", 11));
                    if(tf_artist_w > artist_w) {
                        tf_artist_w = artist_w;
                        this.tooltip = true;
                    } else {
                        this.tooltip = false;
                    };
                    if(tf_title_w < columns.title_w) {
                        gr.GdiDrawText(" "+panel.tag_separator+" "+this.artist, gdi.Font("tahoma", 11), g_textcolor_hl, artist_x, this.y, artist_w, this.h-row.parity, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                    };
                };
            } else {
                //if(tf_title_w > columns.title_w) this.tooltip = true;
                tf_artist_w = 0;
            };
            
            // draw playcount
            if(columns.playcount && playcount_w>0) {
                var playcount_x = columns.title_x + tf_title_w + tf_artist_w;
                try {
                    gr.DrawString(this.playcount, mini_font, g_textcolor&0x40ffffff, playcount_x, this.y-4, playcount_w, this.h-row.parity, rc_stringformat);
                } catch(e) {
                    gr.DrawString(this.playcount, gdi.Font("tahoma", 8), g_textcolor&0x40ffffff, playcount_x, this.y-4, playcount_w, this.h-row.parity, rc_stringformat);
                };
            };
            
            // draw rating
            if(columns.rating) {
                // Rating engine
                if(this.rating_hover) {
                    var boolx = false;
                    for (var i = 1; i < 6; i++){
                        if(this.track_type<2){
                            var r_color = (i > (this.rating_hover ? this.l_rating : this.rating)) ? g_textcolor&0x12ffffff : (this.rating_hover ? (i==this.rating ? (i==this.l_rating ? RGB(255,50,50) : g_textcolor_sel) : g_textcolor_sel) : g_textcolor&0x90ffffff);
                            if(this.rating_hover && this.l_rating==this.rating) {
                                r_color = i<=this.l_rating ? RGB(255,50,50) : g_textcolor&0x12ffffff;
                                boolx = i<=this.l_rating ? true : false;
                            }
                        } else {
                            var r_color = g_textcolor&0x12ffffff;
                            boolx = false;
                        };
                        gr.SetTextRenderingHint(5);
                        if(g_font_guifx_found) {
                            if(boolx){
                                gr.DrawString("x", del_rating_font, r_color, columns.rating_x+14*(i-1)+1, this.y-1, 14, row.h, lc_stringformat);
                            } else {
                                gr.DrawString("b", rating_font, r_color, columns.rating_x+14*(i-1), this.y, 14, row.h, lc_stringformat);
                            };
                        } else {
                            if(boolx){
                                gr.DrawString("×", rating_font, r_color, columns.rating_x+13*(i-1)+1, this.y-1, 13, row.h, lc_stringformat);
                            } else {
                                gr.DrawString("★", rating_font, r_color, columns.rating_x+13*(i-1), this.y-1, 13, row.h, lc_stringformat);
                            };
                        };
                    };
                } else {
                    if(g_font_guifx_found) {
                        gr.SetTextRenderingHint(5);
                        gr.DrawString("bbbbb", rating_font, g_textcolor&0x12ffffff, columns.rating_x, this.y-1, columns.rating_w+1, row.h, lc_stringformat);
                        gr.DrawString("b".repeat(Math.round(this.rating)), rating_font, g_textcolor&0x90ffffff, columns.rating_x, this.y-1, columns.rating_w+1, row.h, lc_stringformat);
                    } else {
                        gr.SetTextRenderingHint(3);
                        gr.DrawString("★★★★★", rating_font, g_textcolor&0x12ffffff, columns.rating_x, this.y-1, columns.rating_w+1, row.h, lc_stringformat);
                        gr.DrawString("★".repeat(Math.round(this.rating)), rating_font, g_textcolor&0x90ffffff, columns.rating_x, this.y-1, columns.rating_w+1, row.h, lc_stringformat);
                    };
                };
            };

            // draw bitrate
            if(columns.bitrate) {
                try {
                    gr.GdiDrawText(bitrate, g_font, isplaying?g_textcolor_sel:g_textcolor, columns.bitrate_x, this.y, columns.bitrate_w, this.h-row.parity, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                } catch(e) {
                    gr.GdiDrawText(bitrate, gdi.Font("tahoma", 11), isplaying?g_textcolor_sel:g_textcolor, columns.bitrate_x, this.y, columns.bitrate_w, this.h-row.parity, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                };
            };
            
            // draw Mood icon
            if(columns.mood) {
                if(this.track_type<2){
                    r_color = this.mood_hover ? g_textcolor_sel : (this.mood!=0 ? RGB(255,80,120) : g_textcolor&0x12ffffff);
                } else {
                    var r_color = g_textcolor&0x12ffffff;
                };
                if(g_font_guifx_found) {
                    gr.SetTextRenderingHint(4);
                    gr.DrawString("v", mood_font, r_color, columns.mood_x, this.y+1, columns.mood_w, row.h, lc_stringformat);
                } else {
                    gr.SetTextRenderingHint(4);
                    gr.DrawString("♥", mood_font, r_color, columns.mood_x, this.y, columns.mood_w, row.h, lc_stringformat);
                };

            };
            
            // draw playbacktime/duration
            try {
                gr.GdiDrawText(duration, g_font, isplaying?g_textcolor_sel:g_textcolor, columns.duration_x, this.y, columns.duration_w, this.h-row.parity, DT_RIGHT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
            } catch(e) {
                gr.GdiDrawText(duration, gdi.Font("tahoma", 11), isplaying?g_textcolor_sel:g_textcolor, columns.duration_x, this.y, columns.duration_w, this.h-row.parity, DT_RIGHT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
            };
            
            // if dragging items, draw line at top of the hover items to show where dragged items will be inserted on mouse button up
            if(dragndrop.drag_in && this.ishover && panel.ishover) {
                if(!plman.IsPlaylistItemSelected(plman.ActivePlaylist, this.id)) {
                    if(this.id>dragndrop.drag_id) {
                        gr.DrawLine(this.x+5, this.y+this.h, ww-vscrollbar.w-5, this.y+this.h, 2.0, g_textcolor);
                        gr.DrawImage(icon_arrow_left, this.x, this.y+this.h-4, 8, 8, 0, 0, 8, 8, 0, 255);
                        gr.DrawImage(icon_arrow_left, this.x+ww-vscrollbar.w, this.y+this.h-4, -8, 8, 0, 0, 8, 8, 0, 255);
                        dragndrop.drop_id = this.id;
                    } else if(this.id<dragndrop.drag_id) {
                        gr.DrawLine(this.x+5, this.y, ww-vscrollbar.w-5, this.y, 2.0, g_textcolor);
                        gr.DrawImage(icon_arrow_left, this.x, this.y-4, 8, 8, 0, 0, 8, 8, 0, 255);
                        gr.DrawImage(icon_arrow_left, this.x+ww-vscrollbar.w, this.y-4, -8, 8, 0, 0, 8, 8, 0, 255);
                        dragndrop.drop_id = this.id;
                    };
                };
            };

        } else if(this.gridx==group.nbrows && group.nbrows>0) {
            // ---------------------
            // ::: Draw group Header
            // ---------------------
            
            // total items in the group
            var total_grp_items = list.groups[list.hlist[this.id]-1];
            
            // background
            if(group.nbrows>1 && group.type==0) {  // display the year only if group by album (group.type = 0)
                var date_str = gr.MeasureString(this.date, gh_date_font, 0, 0, 200, 30, 0);
                var year_x = ww-vscrollbar.w-date_str.Width-cover.margin;
                var year_w = (group.nbrows>1 && (this.album.length>0 || total_grp_items==1) && this.date)?date_str.Width+cover.margin*2:0;
            } else {
                var year_x = 0;
                var year_w = 0;
            };
            gr.FillGradRect(this.x, this.y-((group.nbrows-1)*row.h), this.w-vscrollbar.w-year_w, group.nbrows*row.h, 90, RGBA(255,255,255,15), RGBA(0,0,0,15), 1.0);
            //
            gr.FillGradRect(this.x-30, this.y-((group.nbrows-1)*row.h), this.w-vscrollbar.w+60, 1, 0, 0, RGBA(0,0,0,15), 0.5);
            gr.FillSolidRect(this.x, this.y-((group.nbrows-1)*row.h)+1, this.w-vscrollbar.w, 1, RGBA(255,255,255,15));
            gr.FillSolidRect(this.x, this.y+row.h-0, this.w-vscrollbar.w, 1, RGBA(255,255,255,5));
            gr.FillSolidRect(this.x, this.y+row.h-1, this.w-vscrollbar.w, 1, RGBA(0,0,0,15));
            // draw cover art
            if(cover.show && cover.visible && this.y>(0-group.nbrows*row.h) && this.y<(wh-toolbar.h)+(group.nbrows*row.h)) {
                // cover bg
                var cv_x = this.x+cover.margin;
                var cv_y = ((this.y+row.h)-(row.h*group.nbrows))+cover.margin;
                var cv_w = cover.w-cover.margin*2;
                var cv_h = cover.h-cover.margin*2;
                if(!cover.keepaspectratio) {
                    gr.FillSolidRect(cv_x+1, cv_y+1, cv_w-2, cv_h-2, g_backcolor);
                    gr.FillSolidRect(cv_x+1, cv_y+1, cv_w-2, cv_h-2, g_textcolor&0x15ffffff);
                    gr.DrawRect(cv_x, cv_y, cv_w-1, cv_h-1, 1.0, g_textcolor&0x80ffffff);
                };
                //
                this.cover_img = g_image_cache.hit(this);
                //
                if(this.cover_img) {
                    if(cover.keepaspectratio) {
                        // *** check aspect ratio *** //
                        if(this.cover_img.Height>=this.cover_img.Width) {
                            var ratio = this.cover_img.Width / this.cover_img.Height;
                            var pw = cv_w*ratio;
                            var ph = cv_h;
                            this.left = Math.floor((ph-pw) / 2);
                            this.top = 0;
                            cv_x += this.left;
                            cv_y += this.top*1;
                            cv_w = cv_w - this.left*2 - cover.margin - 1;
                            cv_h = cv_h - this.top*2 - cover.margin - 1;
                        } else {
                            var ratio = this.cover_img.Height / this.cover_img.Width;
                            var pw = cv_w;
                            var ph = cv_h*ratio;
                            this.top = Math.floor((pw-ph) / 2);
                            this.left = 0;
                            cv_x += this.left;
                            cv_y += this.top*1;
                            cv_w = cv_w - this.left*2 - cover.margin - 1;
                            cv_h = cv_h - this.top*2 - cover.margin - 1;
                        };
                        // *** check aspect ratio *** //
                    };
                    
                    // Draw Cover Art (when available)
                    if(cover.keepaspectratio) {
                        gr.DrawRect(cv_x+2, cv_y+2, cv_w+cover.margin*1, cv_h+cover.margin*1, 1.0, RGBA(0,0,0,15));
                        gr.DrawRect(cv_x+1, cv_y+1, cv_w+cover.margin*1, cv_h+cover.margin*1, 1.0, RGBA(0,0,0,45));
                        gr.DrawImage(this.cover_img, cv_x, cv_y, cover.w, cover.h, 0, 0, cover.w, cover.h, 0, 255);
                        gr.DrawRect(cv_x, cv_y, cv_w+cover.margin*1, cv_h+cover.margin*1, 1.0, g_backcolor);
                        gr.DrawRect(cv_x, cv_y, cv_w+cover.margin*1, cv_h+cover.margin*1, 1.0, g_textcolor&0x80ffffff);                    
                    } else {
                        gr.DrawRect(cv_x+2, cv_y+2, cv_w-1, cv_h-1, 1.0, RGBA(0,0,0,15));
                        gr.DrawRect(cv_x+1, cv_y+1, cv_w-1, cv_h-1, 1.0, RGBA(0,0,0,45));
                        gr.DrawImage(this.cover_img, cv_x, cv_y, cover.w, cover.h, 0, 0, cover.w, cover.h, 0, 255);
                        gr.DrawRect(cv_x, cv_y, cv_w-1, cv_h-1, 1.0, g_backcolor);
                        gr.DrawRect(cv_x, cv_y, cv_w-1, cv_h-1, 1.0, g_textcolor&0x80ffffff);
                    };
                };
            };
            
            // draw TF text info of the group header
            var grp_y = cover.margin+this.y-((group.nbrows-1)*row.h);
            var grp_h = group.nbrows*row.h - cover.margin*2;
            
            // Year info (& date separator & backgound)
            if(year_w>0) {
                gr.FillSolidRect(ww-vscrollbar.w-year_w, this.y-((group.nbrows-1)*row.h), year_w, group.nbrows*row.h, RGBA(0,0,0,15));
                gr.FillGradRect(ww-vscrollbar.w-year_w, this.y-((group.nbrows-1)*row.h), 5, group.nbrows*row.h, 00, RGBA(0,0,0,15), 0, 1.0);
                gr.FillGradRect(ww-vscrollbar.w-year_w-1, this.y-((group.nbrows-1)*row.h)+5, 1, group.nbrows*row.h-10, 90, 0, RGBA(255,255,255,25), 0.5);
                gr.FillGradRect(ww-vscrollbar.w-year_w+0, this.y-((group.nbrows-1)*row.h)+5, 1, group.nbrows*row.h-10, 90, 0, RGBA(0,0,0,40), 0.5);
                gr.FillGradRect(ww-vscrollbar.w-year_w+1, this.y-((group.nbrows-1)*row.h)+10, 1, group.nbrows*row.h-20, 90, 0, RGBA(0,0,0,15), 0.5);
                gr.FillGradRect(ww-vscrollbar.w-year_w+1, this.y-((group.nbrows-1)*row.h)+15, 1, group.nbrows*row.h-30, 90, 0, RGBA(0,0,0,5), 0.5);
                gr.SetTextRenderingHint(3);
                gr.DrawString(this.date, gh_date_font, g_backcolor&0xddffffff, year_x, grp_y-7, year_w, group.nbrows*row.h-1, lc_stringformat);
                gr.DrawString(this.date, gh_date_font, g_textcolor&0x25ffffff, year_x, grp_y-8, year_w, group.nbrows*row.h-1, lc_stringformat);
            };
            
            // Artist + Album infos
            if(group.type==0) {
                var album_tag = this.album.length>0?this.album:(total_grp_items>1?"Singles":"Single");
                if(group.nbrows>1) {
                    var text_x = (cover.show && cover.visible) ? this.x+cover.w : this.x + cover.margin;
                    var text_w = (ww-vscrollbar.w)-cover.w-cover.margin*2-(year_w-5);
			var ai_y = this.albumartist ? grp_y+Math.floor(grp_h/group.nbrows) : grp_y;
			var ai_h = this.albumartist ? Math.ceil(grp_h/group.nbrows) : grp_h;
			try {
				if (this.albumartist) {
					gr.GdiDrawText(this.albumartist, g_font, g_backcolor, text_x, grp_y+1, text_w, Math.floor(grp_h/group.nbrows), DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
					gr.GdiDrawText(this.albumartist, g_font, g_textcolor_hl, text_x, grp_y, text_w, Math.floor(grp_h/group.nbrows), DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				}
				gr.GdiDrawText(album_tag+this.disc_info, g_font, g_backcolor, text_x, ai_y+1, text_w, ai_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				gr.GdiDrawText(album_tag+this.disc_info, g_font, g_textcolor_hl, text_x, ai_y, text_w, ai_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
			} catch(e) {
				if (this.albumartist) gr.GdiDrawText(this.albumartist, gdi.Font("tahoma",11), g_textcolor_hl, text_x, grp_y, text_w, Math.floor(grp_h/group.nbrows), DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				gr.GdiDrawText(album_tag+this.disc_info, gdi.Font("tahoma",11), g_textcolor_hl, text_x, ai_y, text_w, ai_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
			};
                } else {
                    gr.DrawImage(singleline_group_header_icon, cover.margin, this.y+Math.floor(row.h/2)-8, 16, 16, 0, 0, 16, 16, 0, 255);
                    var text_x = this.x+cover.margin+singleline_group_header_icon.Width;
                    var text_w = ww-vscrollbar.w-cover.margin*2-singleline_group_header_icon.Width;
                    var aa = this.albumartist ? this.albumartist+" "+panel.tag_separator+" " : "";
                    try {
                        gr.GdiDrawText(aa+album_tag+this.disc_info, g_font, g_backcolor, text_x, grp_y+1, text_w, grp_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                        gr.GdiDrawText(aa+album_tag+this.disc_info, g_font, g_textcolor_hl, text_x, grp_y, text_w, grp_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                    } catch(e) {
                        gr.GdiDrawText(aa+album_tag+this.disc_info, gdi.Font("tahoma",11), g_textcolor_hl, text_x, grp_y, text_w, grp_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                    };
                };
            } else {
                var t_path = this.group_key;
                if(group.nbrows>1) {
                    var text_x = (cover.show && cover.visible) ? this.x+cover.w : this.x + cover.margin;
                    var text_w = (ww-vscrollbar.w)-cover.w-cover.margin*2-(year_w-5);
                    try {
                        gr.GdiDrawText(t_path, g_font, g_backcolor, text_x, grp_y+1, text_w, grp_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                        gr.GdiDrawText(t_path, g_font, g_textcolor_hl, text_x, grp_y, text_w, grp_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                    } catch(e) {
                        gr.GdiDrawText(t_path, gdi.Font("tahoma",11), g_textcolor_hl, text_x, grp_y, text_w, grp_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                   };
                } else {
                    gr.DrawImage(singleline_group_header_icon, cover.margin, this.y+Math.floor(row.h/2)-8, 16, 16, 0, 0, 16, 16, 0, 255);
                    var text_x = this.x+cover.margin+singleline_group_header_icon.Width;
                    var text_w = ww-vscrollbar.w-cover.margin*2-singleline_group_header_icon.Width;
                    try {
                        gr.GdiDrawText(t_path, g_font, g_backcolor, text_x, grp_y+1, text_w, grp_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                        gr.GdiDrawText(t_path, g_font, g_textcolor_hl, text_x, grp_y, text_w, grp_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                    } catch(e) {
                        gr.GdiDrawText(t_path, gdi.Font("tahoma",11), g_textcolor_hl, text_x, grp_y, text_w, grp_h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
                    };
                }; 
            };
            
            // extra group infos (3rd line)
            gr.SetTextRenderingHint(5);
            //var total_grp_length = TimeFromSeconds(list.groups[list.hlist[this.id]-1]);
            if(group.nbrows==2 && group.type!=0) {
                try {
                    gr.DrawString(total_grp_items+(total_grp_items>1?" TRKS":" TRK")+" | "+this.codec+" | "+this.genre.toUpperCase(), mini_font, g_textcolor&0x44ffffff, text_x+1, (this.y-cover.margin)+2, text_w-1, row.h, lb_stringformat);
                } catch(e) {
                    gr.DrawString(total_grp_items+(total_grp_items>1?" TRKS":" TRK")+" | "+this.codec+" | "+this.genre.toUpperCase(), gdi.Font("tahoma",11), g_textcolor&0x44ffffff, text_x+1, (this.y-cover.margin)+2, text_w-1, row.h, lb_stringformat);
                };
            } else if(group.nbrows>2) {
                try {
                    gr.DrawString(total_grp_items+(total_grp_items>1?" TRKS":" TRK")+" | "+this.codec+" | "+this.genre.toUpperCase(), mini_font, g_textcolor&0x44ffffff, text_x+1, (this.y-cover.margin)+2, text_w-1, row.h, lc_stringformat);
                } catch(e) {
                    gr.DrawString(total_grp_items+(total_grp_items>1?" TRKS":" TRK")+" | "+this.codec+" | "+this.genre.toUpperCase(), gdi.Font("tahoma",11), g_textcolor&0x44ffffff, text_x+1, (this.y-cover.margin)+2, text_w-1, row.h, lc_stringformat);
                };
            };
        };
        
        if(group.nbrows>0 && this.gridx>0) {
            // if dragging items, draw line at top of the hover items to show where dragged items will be inserted on mouse button up
            if(dragndrop.drag_in && this.ishover && panel.ishover) {
                if(!plman.IsPlaylistItemSelected(plman.ActivePlaylist, this.id)) {
                    if(this.id<=dragndrop.drag_id) {
                        gr.DrawLine(this.x+5, this.y-(this.gridx-1)*row.h, ww-vscrollbar.w-5, this.y-(this.gridx-1)*row.h, 2.0, g_textcolor);
                        gr.DrawImage(icon_arrow_left, this.x, this.y-(this.gridx-1)*row.h-4, 8, 8, 0, 0, 8, 8, 0, 255);
                        gr.DrawImage(icon_arrow_left, this.x+ww-vscrollbar.w, this.y-(this.gridx-1)*row.h-4, -8, 8, 0, 0, 8, 8, 0, 255);
                        dragndrop.drop_id = this.id;
                    } else {
                        gr.DrawLine(this.x+5, this.y+(group.nbrows-this.gridx+1)*row.h, ww-vscrollbar.w-5, this.y+(group.nbrows-this.gridx+1)*row.h, 2.0, g_textcolor);
                        gr.DrawImage(icon_arrow_left, this.x, this.y+(group.nbrows-this.gridx+1)*row.h-4, 8, 8, 0, 0, 8, 8, 0, 255);
                        gr.DrawImage(icon_arrow_left, this.x+ww-vscrollbar.w, this.y+(group.nbrows-this.gridx+1)*row.h-4, -8, 8, 0, 0, 8, 8, 0, 255);
                        dragndrop.drop_id = this.id>0?this.id-1:0;
                    };
                };
            };            
        };
        
    };

    this.checkstate = function (event, x, y, id) {
        var state = 0;
        if(y<toolbar.delta) return true;
        var act_pls = plman.ActivePlaylist;
        var prev_rating_hover = this.rating_hover;
        var prev_l_rating = this.l_rating;
        var prev_mood_hover = this.mood_hover;
        var prev_l_mood = this.l_mood;
        if(y>toolbar.h) {
            this.ishover = (x > this.x && x < this.x + this.w - vscrollbar.w && y >= this.y && y < this.y + this.h);
        } else {
            this.ishover = false;
        };
        this.rating_hover = (this.gridx==0 && x>=columns.rating_x && x<=columns.rating_x+columns.rating_w && y>this.y+2 && y<this.y+this.h-2);
        this.mood_hover = (this.gridx==0 && x>=columns.mood_x && x<=columns.mood_x+columns.mood_w-3 && y>this.y+2 && y<this.y+this.h-2);
        
        if(row.buttons_hover) {
            toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
            toolbar.timerID_on = false;
        } else {
            row.buttons_hover = (this.rating_hover || this.mood_hover);
        };
        
        switch (event) {
        case "down":
            if(this.gridx>0) {
                if(this.ishover) {
                    SelectGroupItems(this.id);
                    if(list.metadblist_selection.Count>=1) {
                        dragndrop.drag_out = true;
                        dragndrop.drag_id = this.id;
                        if(!isQueuePlaylistActive()) {
                            dragndrop.timerID = window.SetTimeout(function() {
                                dragndrop.drag_in = true;
                                dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
                                dragndrop.timerID = false;
                            }, 250);
                        };
                    };
                };
            } else {
                if(this.rating_hover) {
                    columns.rating_drag = true;
                } else if(this.mood_hover) {
                    columns.mood_drag = true;
                } else {
                    if(plman.IsPlaylistItemSelected(act_pls, this.id)) {
                        if(this.ishover) {
                            if(list.metadblist_selection.Count>=1) {
                                dragndrop.drag_out = true;
                                if(list.metadblist_selection.Count>1) {
                                    // test if selection is contigus, if not, drag'n drop disable
                                    var first_item_selected_id = list.handlelist.Find(list.metadblist_selection.item(0));
                                    var last_item_selected_id = list.handlelist.Find(list.metadblist_selection.item(list.metadblist_selection.Count-1));
                                    var contigus_count = (last_item_selected_id - first_item_selected_id)+1;
                                } else {
                                    var contigus_count = 0;
                                };
                                if(list.metadblist_selection.Count==1 || list.metadblist_selection.Count == contigus_count) {
                                    dragndrop.drag_id = this.id;
                                    if(!isQueuePlaylistActive()) {
                                        dragndrop.timerID = window.SetTimeout(function() {
                                            dragndrop.drag_in = true;
                                            dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
                                            dragndrop.timerID = false;
                                        }, 250);
                                    };
                                };
                            };
                            if(utils.IsKeyPressed(VK_SHIFT)) {
                                if(list.focus_id != this.id) {
                                    if(list.SHIFT_start_id!=null) {
                                        SelectAtoB(list.SHIFT_start_id, this.id);
                                    } else {
                                        SelectAtoB(list.focus_id, this.id);
                                    };
                                };
                            } else if(utils.IsKeyPressed(VK_CONTROL)) {
                                if(plman.GetPlaylistFocusItemIndex(act_pls)!=this.id) {
                                    plman.SetPlaylistSelectionSingle(act_pls, this.id, false);
                                };
                            } else if(list.metadblist_selection.Count==1) {
                                plman.SetPlaylistFocusItem(act_pls, this.id);
                                plman.ClearPlaylistSelection(act_pls);
                                plman.SetPlaylistSelectionSingle(act_pls, this.id, true);
                            };
                        };
                    } else {
                        if(this.ishover) {
                            if(utils.IsKeyPressed(VK_SHIFT)) {
                                if(list.focus_id != this.id) {
                                    if(list.SHIFT_start_id!=null) {
                                        SelectAtoB(list.SHIFT_start_id, this.id);
                                    } else {
                                        SelectAtoB(list.focus_id, this.id);
                                    };
                                };
                            } else if(utils.IsKeyPressed(VK_CONTROL)) {
                                plman.SetPlaylistFocusItem(act_pls, this.id);
                                plman.SetPlaylistSelectionSingle(act_pls, this.id, true);
                            } else {
                                plman.SetPlaylistFocusItem(act_pls, this.id);
                                plman.ClearPlaylistSelection(act_pls);
                                plman.SetPlaylistSelectionSingle(act_pls, this.id, true);
                            };
                        };
                    };
                    list.metadblist_selection = plman.GetPlaylistSelectedItems(act_pls);
                };
            };
            break;

        case "dblclk":
            if(this.gridx==0) {
                if(this.rating_hover) {
                    
                } else if(this.mood_hover) {
                    
                } else {
                    if(!isQueuePlaylistActive()) {
                        if(plman.IsPlaylistItemSelected(act_pls, this.id)) {
                            if(this.ishover) {
                                plman.ExecutePlaylistDefaultAction(act_pls, this.id);
                                window.Repaint();
                            };
                        };
                    };
                };
            };
            break;
            
        case "right":
            if(this.ishover) {
                if(this.rating_hover) {
                    
                } else if(this.mood_hover) {
                    
                } else {
                    if(plman.IsPlaylistItemSelected(act_pls, this.id)) {
                        
                    } else {
                        plman.SetPlaylistFocusItem(act_pls, this.id);
                        plman.ClearPlaylistSelection(act_pls);
                        plman.SetPlaylistSelectionSingle(act_pls, this.id, true);
                    };
                    new_context_menu(x, y, this.id, this.idx);
                    state = -1;
                };
            };
            break;
            
        case "up":
            if(this.ishover) {
                if(this.rating_hover) {
                    // Rating
                    if(this.track_type<2) {
                        if(foo_playcount) {
                            // Rate to database statistics brought by foo_playcount.dll
                            if (this.l_rating != this.rating) {
                                if(this.metadb) {
                                    var bool = fb.RunContextCommandWithMetadb("Rating/"+((this.l_rating==0) ? "<not set>" : this.l_rating), this.metadb);
                                    this.rating = this.l_rating;
                                };
                            } else {
                                var bool = fb.RunContextCommandWithMetadb("Rating/<not set>", this.metadb);
                                this.rating = 0;
                            };
                        } else {
                            // Rate to file
                            if (this.l_rating != this.rating) {
                                if(this.metadb) {
                                    var bool = this.metadb.UpdateFileInfoSimple("RATING", this.l_rating);
                                    this.rating = this.l_rating;
                                };
                            } else {
                                var bool = this.metadb.UpdateFileInfoSimple("RATING","");
                                this.rating = 0;
                            };
                        };
                    };
                } else if(this.mood_hover) {
                    // Mood
                    if(this.track_type<2) {
                        // tag to file
                        if (this.l_mood != this.mood) {
                            if(this.metadb) {
                                var bool = this.metadb.UpdateFileInfoSimple("MOOD", getTimestamp());
                                this.mood = this.l_mood;
                            };
                        } else {
                            var bool = this.metadb.UpdateFileInfoSimple("MOOD","");
                            this.mood = 0;
                        };
                    };
                } else {
                    if(plman.IsPlaylistItemSelected(act_pls, this.id)) {
                        if(!utils.IsKeyPressed(VK_SHIFT) && !utils.IsKeyPressed(VK_CONTROL)) {
                            if(!dragndrop.drag_in) {
                                if(this.gridx==0) {
                                    plman.SetPlaylistFocusItem(act_pls, this.id);
                                    plman.ClearPlaylistSelection(act_pls);
                                    plman.SetPlaylistSelectionSingle(act_pls, this.id, true);
                                };
                            };
                            dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
                            dragndrop.timerID = false;
                            dragndrop.drag_in = false;
                            dragndrop.drag_out = false;
                        };
                    };
                };
            };
            columns.rating_drag = false;
            columns.mood_drag = false;
            break;
            
        case "move":

            if(columns.rating && !columns.rating_drag) {
                if(this.rating_hover) {
                    this.l_rating = Math.floor((x - columns.rating_x) / (g_font_guifx_found?14:12)) + 1;
                    if(this.l_rating>5) this.l_rating = 5;
                } else {
                    this.l_rating = 0;
                };
                if(this.rating_hover != prev_rating_hover || this.l_rating != prev_l_rating) {
                    repaint_rating(this.y);
                };
            };
            if(columns.mood && !columns.mood_drag) {
                if(this.mood_hover) {
                    this.l_mood = 1;
                } else {
                    this.l_mood = 0;
                };
                if(this.mood_hover != prev_mood_hover || this.l_mood != prev_l_mood) {
                    repaint_mood(this.y);
                };
            };
            break;
            
        case "leave":
        
            break;
        };
        return state;
    };
};

//=================================================// Titleformat field
var tf_cover_path = fb.TitleFormat("$replace(%path%,%filename_ext%,)");
var tf_tracknumber = fb.TitleFormat("$num($if2(%tracknumber%,0),2)");
//var tf_artist = fb.TitleFormat("$if(%length%,%artist%,'Stream')");
var tf_artist = fb.TitleFormat("$if(%length%,$if2(%artist%,$ifgreater($strchr(%filename%,-),0,$trim($substr(%filename%,1,$sub($strchr(%filename%,-),1)))*,?)),)");
var tf_titleO = fb.TitleFormat("%title%");
var tf_title = fb.TitleFormat("$ifgreater($strchr(%filename%,-),0,$trim($substr(%filename%,$add($strchr(%filename%,-),1),100)*),%title%)");
var tf_albumartist = fb.TitleFormat("$if(%length%,%album artist%,)");
var tf_album = fb.TitleFormat("$if2(%album%,$if(%length%,,'Web Radio'))");
var tf_disc = fb.TitleFormat("$if2(%discnumber%,0)");
var tf_disc_info = fb.TitleFormat("$if(%discnumber%,$ifgreater(%totaldiscs%,1,' - [Disc '%discnumber%$if(%totaldiscs%,'/'%totaldiscs%']',']'),),)");
var tf_rating = fb.TitleFormat("$if2(%rating%,0)");
var tf_mood = fb.Titleformat("$if(%mood%,1,0)");
var tf_playcount = fb.TitleFormat("$if2(%play_counter%,$if2(%play_count%,0))");
var tf_duration = fb.TitleFormat("$if2(%length%,' 0:00')");
var tf_date = fb.TitleFormat("[$year($replace(%date%,/,-,.,-))]");
var tf_genre = fb.TitleFormat("$if2(%genre%,'Other')");
var tf_playback_time = fb.TitleFormat("%playback_time%");
var tf_playback_time_remaining = fb.TitleFormat("$if(%length%,>%playback_time_remaining%,'0:00')");
var tf_length_seconds = fb.TitleFormat("%length_seconds_fp%");
// GROUP
var tf_group_key = fb.TitleFormat(group_pattern_album);
// TECH 
var tf_codec = fb.Titleformat("%__codec%");
var tf_samplerate = fb.Titleformat("%__samplerate%");
var tf_bitrate = fb.TitleFormat("$if(%__bitrate_dynamic%,$if(%el_isplaying%,%__bitrate_dynamic%'K',$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K')),$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K'))");
var tf_bitrate_playing = fb.TitleFormat("$if(%__bitrate_dynamic%,$if(%_isplaying%,$select($add($mod(%_time_elapsed_seconds%,2),1),%__bitrate_dynamic%,%__bitrate_dynamic%),%__bitrate_dynamic%),%__bitrate%)'K'");
var tf_channels = fb.TitleFormat("$if($stricmp($codec(),MP3),$get(space2)$caps(%__mp3_stereo_mode%),$if(%__channels%,$ifgreater(%__channels%,1,Stereo,Mono),$if($strcmp(%__channels%,4),4 Ch,$sub(%__channels%,1)'.1' Ch)))");


//=================================================// Globals
var g_instancetype = window.InstanceType;
var g_font = null;
var g_font_headers = null;
var gh_date_font = gdi.Font("Segoe UI", 25, 2);
var g_font_guifx_found = utils.CheckFont("guifx v2 transports");
var rating_font = null;
var mood_font = null;
var del_rating_font = null;
var mini_font = gdi.Font("uni 05_53", 8, 0);
var ww = 0, wh = 0;
var mouse_x = 0, mouse_y = 0;
var g_textcolor = 0, g_textcolor_sel = 0, g_textcolor_hl = 0, g_backcolor = 0, g_backcolor_sel = 0;
var g_backcolor_R = 0, g_backcolor_G = 0, g_backcolor_B = 0;
var g_syscolor = 0;
var g_metadb;
var bool_on_size = false;
var g_search_string = "";
var incsearch_font = gdi.Font("Segoe UI", 9, 0);
var incsearch_font_big = gdi.Font("Segoe UI", 20, 1);
var clear_incsearch_timer = false;
var incsearch_timer = false;
var g_playing_item_y = null;
var g_seconds = 0;
var foo_playcount = utils.CheckComponent("foo_playcount", true);
//var g_tooltip = window.CreateTooltip();
//var g_tooltip_timer = false;
//var show_tooltip = false;
var moved;
var g_menu_displayed = false;
var g_add_items_timerID = false;
var g_drag = false;
var COLOR_BTNFACE = 15;

panel = {
	themed: window.GetProperty("外觀|系統主題", true),
	wallpaper_path: window.GetProperty("外觀|背景|圖片路徑", ".\\images\\background.jpg"),
    wallpaper_img: false,
	show_wallpaper: window.GetProperty("外觀|背景|圖片", false),
	show_shadow_border: window.GetProperty("外觀|邊框陰影", true),
	opacity: window.GetProperty("外觀|透明度（0~255）", 255),
	custom_textcolor: window.GetProperty("外觀|顏色|文字|一般", "RGB(200,200,210)"),
	custom_textcolor_selection: window.GetProperty("外觀|顏色|文字|播放", "RGB(64,128,200)"),
	custom_textcolor_highlight: window.GetProperty("外觀|顏色|文字|標明", "RGB(150,200,250)"),
	custom_backcolor: window.GetProperty("外觀|顏色|背景", "RGB(30,30,35)"),
	custom_colors: window.GetProperty("外觀|顏色|自訂色彩", false),
	nogroupheader: window.GetProperty("外觀|隱藏群組標題", false),
	tag_separator: window.GetProperty("外觀|分隔符號", "|")
};

dragndrop = {
	enabled: window.GetProperty("系統|游標托放", true),
    drag_id: -1,
    drop_id: -1,
    timerID: false,
    drag_in: false,
    drag_out: false
};

clipboard = {
    selection: null
};

columns = {
	playicon: window.GetProperty("外觀|欄位|播放圖示", true),
    playicon_x: 0,
    playicon_w: 0,
	tracknumber: window.GetProperty("外觀|欄位|曲目編號", true),
    tracknumber_x: 0,
    tracknumber_w: 0,
	title: window.GetProperty("外觀|欄位|歌曲標題|模式", 1),
    title_x: 0,
    title_w: 0,
	rating: window.GetProperty("外觀|欄位|歌曲評等", true),
    rating_x: 0,
    rating_w: 0,
    rating_timerID: false,
    rating_drag: false,
	mood: window.GetProperty("外觀|欄位|我的最愛", true),
    mood_x: 0,
    mood_w: 0,
    mood_timerID: false,
    mood_drag: false,
	bitrate: window.GetProperty("外觀|欄位|位元速率", false),
    bitrate_x: 0,
    bitrate_w: 0,
    duration_x: 0,
    duration_w: 0,
	playcount: window.GetProperty("外觀|欄位|播放次數", true)
};

list = {
    theme: false,
    first_launch: true,
    total: 0,
    total_gh: 0,
    total_with_gh: 0,
    nbvis: 0,
    gridx: 0,
    item: Array(),
    hlist: Array(),
    empty: Array(),
    groups: Array(),
    collapse: false,
    handlelist: null,
    metadblist_selection: plman.GetPlaylistSelectedItems(plman.ActivePlaylist),
    focus_id: 0,
    tocut: 0,
	mousewheel_scrollstep: window.GetProperty("系統|滾動行數|滑鼠", 3),
    nowplaying: 0,
    SHIFT_start_id: null,
    SHIFT_count: 0,
    inc_search_noresult: false,
    keypressed: false,
    buttonclicked: false,
	gradient_lines_show: window.GetProperty("外觀|立體框線", false)
};
row = {
	h: window.GetProperty("外觀|列高", 25),
    parity: 0,
	show_progress: window.GetProperty("外觀|播放進度", true),
    buttons_hover: false
};
group = {
	nbrows_default: window.GetProperty("外觀|群組列數", 3),
    nbrows: 0,
    min_item_per_group: 5,
	type: window.GetProperty("系統|群組模式", 0),
	key: window.GetProperty("系統|群組關鍵字", group_pattern_album),
    w: 0
};
toolbar = {
    h: 0,
	lock: window.GetProperty("系統|鎖定工具列", false),
    buttons: Array(),
    timerID_on: false,
    timerID_off: false,
    timerID1: false,
    timerID2: false,
    collapsed_y: -24,
    delta: 0,
    step: 3,
    state: false
};
vscrollbar = {
    theme: false,
	show: window.GetProperty("外觀|卷軸", true),
    visible: true,
    hover: false,
    x: 0,
    y: 0,
    default_w: get_system_scrollbar_width(),
    w: get_system_scrollbar_width(),
    h: 0,
    button_total: 2,
	default_step: window.GetProperty("系統|滾動行數|卷軸", 3),
    step: 3,
    arr_buttons: Array(),
    letter : null
};
scrollbarbt = {
    timerID1: false,
    timerID2: false,
    timer1_value: 400,
    timer2_value: 60
};
button_up = {
    img_normal: null,
    img_hover: null,
    img_down: null,
    x: 0,
    y: 0,
    w: vscrollbar.default_w,
    h: vscrollbar.default_w
};
button_down = {
    img_normal: null,
    img_hover: null,
    img_down: null,
    x: 0,
    y: 0,
    w: vscrollbar.default_w,
    h: vscrollbar.default_w
};
cursor = {
    bt: null,
    img_normal: null,
    img_hover: null,
    img_down: null,
    popup: null,
    x: 0,
    y: 0,
    w: vscrollbar.default_w,
    h: vscrollbar.default_w+3,
    default_h: vscrollbar.default_w+3,
    hover: false,
    drag: false,
    grap_y: 0,
    timerID: false,
    last_y: 0
};
cover = {
	show: window.GetProperty("外觀|封面", true),
	draw_glass_effect: window.GetProperty("外觀|封面|玻璃特效", true),
	keepaspectratio: window.GetProperty("外觀|封面|維持比例", true),
    visible: true,
    margin: 6,
    w: 0,
    nbrows: 0,
    h: 0,
    top_offset: 0,
    load_timer: false
};

// stats globals (used in on_playback_time & on_playback_new_track Callbacks)
stats = {
    metadb: null,
    path_prefix: "",
    taggable_file: false,
	enabled: window.GetProperty("系統|播放統計", false),
    updated: false,
    foo_playcount: utils.CheckComponent("foo_playcount", true),
    tf_length_seconds: fb.TitleFormat("%length_seconds_fp%"),
    tf_first_played: fb.Titleformat("%first_played%"),
    tf_play_counter: fb.Titleformat("%play_counter%"),
    tf_play_count: fb.Titleformat("%play_count%"),
    time_elapsed: 0,
    delay: 0,
    limit: 0
};

//=================================================// Playlist load
function refresh_spv_cursor(pls) {
    
    reset_cover_timers();
    
    // RAZ actual list
    list.item.splice(0, list.item.length);
    list.tocut = 0;

    // calc ratio of the scroll cursor to calc the equivalent item for the full playlist (with gh)
    var ratio = (cursor.y-vscrollbar.y) / (vscrollbar.h-cursor.h);
    
    // calc idx of the item (of the full playlist with gh) to display at top of the panel list (visible)
    var idx = Math.round((list.total_with_gh - list.nbvis) * ratio);
    
    // search what's the item that is the first to display in the list, and calc the list.tocut if needed
    var start_id_min = Math.floor(idx / (group.nbrows+1));
    var b = 0;
    for(var id = start_id_min; id < list.total; id++) {
        b = id + (list.hlist[id]*group.nbrows);
        if(b >= idx) {
            break;
        };
    };
    // item (id) is found, now we check how many line are to cut (c)!
    if(b > idx) {
        var c = b - group.nbrows;
        for(var d = 1; d < group.nbrows+1; d++) {
            if(idx == c + d) {
                list.tocut = d;
                break;
            };
        };
    } else if(b == idx) {
        if(id==0) {
            list.tocut = group.nbrows;
        } else {
            if(list.hlist[id] > list.hlist[id-1]) {
                list.tocut = group.nbrows;
            } else {
                list.tocut = 0;
            };
        };
    };
   
    if(id<=0) {
        id = 0;
        var previous_group_key = null;
    } else {
        var previous_group_key = list.hlist[id-1];
    };
    
    var i = id;
    var k = 0;
    while(i < list.total && k<=list.nbvis+group.nbrows) {
        list.item.push(new item(i, k, 0));
        if(group.nbrows>0) {
            if(list.hlist[i] != previous_group_key) {
                list.item[k].gridx = 1;
                list.item[k].update_infos();
                k++;
                for(var j = 1; j < group.nbrows; j++) {
                    list.item.push(new item(i, k, j+1));
                    k++;
                };
                list.item.push(new item(i, k, 0));
            };
        };
        previous_group_key = list.hlist[i];
        k++;
        i++;
    };
    
    // affect group index of each track of each group in list.item[]
    set_grp_idx_all();
};

//=================================================// Playlist scroll down
function scrolldown_spv(pls, step) {
    
    if(list.item.length<=list.nbvis) return true;
    
    reset_cover_timers();
    
    var last_item_id = list.item[list.item.length-1].id;
    if(last_item_id >= list.total-1) {  // dernier item id = le dernier id de la playlist!
        var last_item_gridx = list.item[list.item.length-1].gridx;
        if(last_item_gridx>0) {
            var k = list.item.length;
            for(var j=last_item_gridx+1;j<=group.nbrows;j++) {
                list.item.push(new item(last_item_id, k, j));
                k++;
            };
            list.item.push(new item(last_item_id, k, 0));
        } else {
            // is last_item already visible? otherwise, no scroll to do, bottom reached!
            var idx_last_item_vis = list.tocut+list.nbvis-1;
            if(idx_last_item_vis>list.item.length-1) idx_last_item_vis = list.item.length-1;
            var last_item_vis_gridx = list.item[idx_last_item_vis].gridx;
            if(last_item_vis_gridx>0) {
                var last_item_vis_id = list.item[idx_last_item_vis].id - 1;
            } else {
                var last_item_vis_id = list.item[idx_last_item_vis].id;
            };
            if(last_item_vis_id >= last_item_id) {
                return true;
            } else {
                // scroll to do (no new item to add at bottom, but tocut index to increase)
                list.tocut++;
            };
        };
    } else {
        // on n'est pas sur le dernier id, on peut en ajouter un au tableau item!
        var last_item_group_key = list.hlist[last_item_id];
        var last_item_gridx = list.item[list.item.length-1].gridx;
        
        if(last_item_gridx > 0) {
            if(last_item_gridx < group.nbrows) {
                var next_item_id = last_item_id;
                var next_item_gridx = last_item_gridx + 1;
            } else {
                var next_item_id = last_item_id;
                var next_item_gridx = 0;
            };
        } else {
            var next_item_id = last_item_id + 1;
            if(list.hlist[next_item_id] != last_item_group_key) {
                if(group.nbrows>0) {
                    var next_item_gridx = 1;
                } else {
                    var next_item_gridx = 0;
                };
            } else {
                var next_item_gridx = 0;
            };
        };
        // add the next item (new one) to the array
        list.item.push(new item(next_item_id, list.item.length, next_item_gridx));
        if(list.item[list.item.length-2].gridx>0) {
            list.item[list.item.length-1].grp_idx = 0;
        } else {
            list.item[list.item.length-1].grp_idx = list.item[list.item.length-2].grp_idx + 1;
        };
        // remove the first item of the array, to always keep the same number of items in the Array
        list.item.shift();
    };
    
    var len = list.item.length;
    for(var i=0; i<len; i++) {
        list.item[i].idx = i;
        list.item[i].defaulty = toolbar.h + i * row.h;
        list.item[i].y = list.item[i].defaulty - (list.tocut * row.h);
    };
          
    setcursory();

};

//=================================================// Playlist scroll up
function scrollup_spv(pls, step) {

    if(list.item.length<list.nbvis) return true;
    
    reset_cover_timers();
    
    var first_item_id = list.item[0].id;
    
    if(first_item_id <= 0) {
        // is the first id already visible? otherwise, no scroll to do, top of the list is already reached!
        var first_item_vis_id = list.item[list.tocut].id;
        if(first_item_id >= first_item_vis_id) {
            if(group.nbrows > 0) {
                var first_item_gridx = list.item[0].gridx;
                if(first_item_gridx==1) {
                    if(list.tocut==0) {
                        return true;
                    } else {
                        list.tocut--;
                    };
                } else {
                    // prev item to add to complete the group header of the first item
                    var prev_item_id = first_item_id;
                    var prev_item_gridx = (first_item_gridx==0) ? group.nbrows : first_item_gridx - 1;
                    // add the next item (new one) to the array
                    list.item.unshift(new item(prev_item_id, 0, prev_item_gridx));
                    // set group index value of the new item
                    if(prev_item_gridx>0) {
                        list.item[0].grp_idx = 0;
                    } else {
                        if(list.item[1].gridx>0) {
                            set_grp_idx_first();
                        } else {
                            list.item[0].grp_idx = list.item[1].grp_idx - 1;
                        };
                    };
                    // remove the last item of the array, to always keep the same number of items in the Array
                    list.item.pop();
                };
            };
        } else {
            // scroll to do (no new item to add at top, but tocut index to decrease)
            list.tocut--;
        };
    } else {
        if(list.tocut>group.nbrows) {
            list.tocut--;
        } else {
            // on n'est pas sur le premier id, on peut en ajouter un au tableau item!
            var first_item_group_key = list.hlist[list.item[0].id];
            var first_item_gridx = list.item[0].gridx;
            
            if(first_item_gridx > 0) {
                if(first_item_gridx == 1) {
                    var prev_item_id = first_item_id - 1;
                    var prev_item_gridx = 0;
                } else {
                    var prev_item_id = first_item_id;
                    var prev_item_gridx = first_item_gridx - 1;
                };
            } else {
                var prev_item_id = first_item_id - 1;
                if(list.hlist[prev_item_id] != first_item_group_key) {
                    if(group.nbrows>0) {
                        prev_item_id = first_item_id;
                        prev_item_gridx = group.nbrows;
                    } else {
                        prev_item_gridx = 0;
                    };
                } else {
                    prev_item_gridx = 0;
                };
            };
            // add the next item (new one) to the array
            list.item.unshift(new item(prev_item_id, 0, prev_item_gridx));
            // set group index value of the new item
            if(prev_item_gridx>0) {
                list.item[0].grp_idx = 0;
            } else {
                if(list.item[1].gridx>0) {
                    set_grp_idx_first();
                } else {
                    list.item[0].grp_idx = list.item[1].grp_idx - 1;
                };
            };
            // remove the last item of the array, to always keep the same number of items in the Array
            if(list.item.length - list.tocut > list.nbvis+1+group.nbrows) {
                list.item.pop();
            };
        };
    };
    
    var len = list.item.length;
    for(i=0;i<len;i++) {
        list.item[i].idx = i;
        list.item[i].defaulty = toolbar.h + i * row.h;
        list.item[i].y = list.item[i].defaulty - (list.tocut * row.h);
    };
           
    setcursory();
};

//=================================================// Playlist load
function refresh_spv(pls, force) {
    
    var nbvis = Math.ceil((wh-toolbar.h)/row.h);
    var mid_nbvis = Math.round(nbvis / 2) - 1;
    
    //g_tooltip.Text="";
    
    reset_cover_timers();
             
    // test if center focus item required   
    if(!force && list.item.length>0) {
        var vis_min_idx = list.item[list.tocut].id;
        var delta2max = (list.tocut+list.nbvis) - 1;
        if(delta2max<list.item.length) {
            vis_max_idx = (list.item[delta2max].gridx==0) ? list.item[delta2max].id : (list.item[delta2max].id - 1);
        } else {
            vis_max_idx = list.item[list.item.length-1].id;
        };
        if(list.focus_id>=vis_min_idx && list.focus_id<=vis_max_idx) {
            if(button_up.timerID && list.focus_id==0 && list.item[list.tocut].gridx!=1) {
                
            } else {
                return true;
            };
        };
    };
    
    var m;
    var focus_idx = 0;
    list.tocut = 0;

    // RAZ actual list
    list.item.splice(0, list.item.length);
    
    if(list.total<=0) return true;
    
    var r = list.focus_id - list.nbvis;
    if(r<=0) {
        r = 0;
        var previous_group_key = null;
    } else {
        var previous_group_key = list.hlist[r-1];
    };
    
    var i = r;
    var k = 0;

    while(i < list.total && k<=((group.nbrows>0?(list.nbvis*group.nbrows):list.nbvis)*2)) {
        list.item.push(new item(i, k, 0));
        if(group.nbrows>0) {
            if(list.hlist[i] != previous_group_key) {
                list.item[k].gridx = 1;
                list.item[k].update_infos();
                k++;
                for(var g=1;g<group.nbrows;g++) {
                    list.item.push(new item(i, k, g+1));
                    k++;
                };
                list.item.push(new item(i, k, 0));
            };
        };
        if(list.item[k].id == list.focus_id) focus_idx = k;
        previous_group_key = list.hlist[i];
        k++;
        i++;
    };
    
    // calc value of list.tocut
    if(list.item.length<=list.nbvis) {
        list.tocut = 0;
    } else {
        list.tocut = focus_idx - mid_nbvis;
        if(list.tocut<=0) {
            list.tocut = 0;
        };
        if(focus_idx+mid_nbvis+1>list.item.length-1) {
            list.tocut = list.item.length - list.nbvis;
        };
    };
    
    // affect group index of each track of each group in list.item[]
    set_grp_idx_all();

    if(vscrollbar.show) {
        if(list.item.length<=list.nbvis) vscrollbar.visible = false; else vscrollbar.visible=true;
    } else {
        vscrollbar.visible = false;
    };
      
    var ratio = list.nbvis / list.total_with_gh;
    if(ratio>1) ratio = 1;
    cursor.h = Math.round(ratio * vscrollbar.h);
    // boundaries for cursor height
    if(cursor.h>vscrollbar.h) cursor.h = vscrollbar.h;
    if(cursor.h<cursor.default_h) cursor.h = cursor.default_h;
    // redraw cursor image
    set_scroller();
    // set cursor position
    setcursory();

};

function set_grp_idx_all() {
    
    if(list.item.length<=0) return true;
    
    if(group.nbrows>0) {
        var id = list.item[0].id;
        var key1 = list.hlist[id];
        var key2 = null;
        var grp_idx = 0;
        if(list.item[0].gridx==0) {
            while(id>0) {
                key2 = list.hlist[id-1];
                if(key2 != key1) {
                    id = 0;
                } else {
                    grp_idx++;
                };
                id--;
            };
        };
        id = list.item[0].id;
        for(var i=0; i < list.item.length; i++) {
            if(list.item[i].gridx==0) {
                list.item[i].grp_idx = grp_idx;
                grp_idx++;
            } else {
                list.item[i].grp_idx = 0;
                grp_idx = 0;
            };
        };
    } else {
        for(var i=0; i < list.item.length; i++) {
            list.item[i].grp_idx = list.item[i].id;
        };
    };
};

function set_grp_idx_first() {
    
    if(list.item.length<=0) return true;
    
    if(group.nbrows>0) {
        var id = list.item[0].id;
        var key1 = list.hlist[id];
        var key2 = null;
        var grp_idx = 0;
        if(list.item[0].gridx==0) {
            while(id>0) {
                key2 = list.hlist[id-1];
                if(key2 != key1) {
                    id = 0;
                } else {
                    grp_idx++;
                };
                id--;
            };
            list.item[0].grp_idx = grp_idx;
        } else {
            list.item[0].grp_idx = 0;
        };
    } else {
        for(var i=0; i < list.item.length; i++) {
            list.item[i].grp_idx = list.item[i].id;
        };
    };
};

//=================================================// Offset calculations
function setcursory() {
    if(list.item.length<=list.nbvis) {
        cursor.y = vscrollbar.y;
    } else if(list.item.length>list.tocut){      
        var first_id = list.item[list.tocut].id;
        if(list.item[list.tocut].gridx == 0) {
            var ratio = (first_id + ((list.hlist[first_id]-0) * group.nbrows)) / (list.total_with_gh-list.nbvis);
        } else {
            var ratio = (first_id + ((list.hlist[first_id]-0) * group.nbrows) - (group.nbrows+1-list.item[list.tocut].gridx)  ) / (list.total_with_gh-list.nbvis);
        };
        if(ratio<0) ratio = 0;
        if(ratio>1) ratio = 1;
        cursor.y = vscrollbar.y + Math.round((vscrollbar.h-cursor.h) * ratio);
    };
};

function init_active_pls() {
    var temp_key1;
    var temp_key2;
    var gh_count = 0;
    var empty = 0;
    var count = 0;
    var grp_length = 0;
    var metadb;
       
    //var d1 = new Date();
    //var t1 = d1.getSeconds()*1000 + d1.getMilliseconds();
    //fb.trace("avant="+t1);
    
    list.hlist.splice(0, list.hlist.length);
    list.empty.splice(0, list.empty.length);
    list.groups.splice(0, list.groups.length);
    
    if(list.handlelist) list.handlelist.Dispose();
    list.handlelist = plman.GetPlaylistItems(plman.ActivePlaylist);
    list.total = list.handlelist.Count;
        
    if(group.nbrows>0) {
        for (var i = 0; i < list.total; i++) {
            metadb = list.handlelist.Item(i);
            temp_key2 = tf_group_key.EvalWithMetadb(metadb);
            if(temp_key1 != temp_key2){
                if(i>0) {
                    list.groups.push(count);
                };
                //list.groups.push(list.collapse);
                if(i>0 && count<group.min_item_per_group) {
                    empty += (group.min_item_per_group - count);
                };
                count = 0;
                //grp_length = 0;
                gh_count++;
                temp_key1 = temp_key2;
            };
            count++;
            //grp_length += metadb.Length;
            list.hlist.push(gh_count);
            list.empty.push(empty);
            // on last item
            if(i == list.total-1) {
                list.groups.push(count);
            };
        };
    } else {
        for (var i = 0; i < list.total; i++) {
            list.hlist.push(0);
            list.empty.push(0);
        };
    };
    list.total_gh = gh_count;
    list.total_with_gh = list.total + (list.total_gh * group.nbrows);
    
    //var d2 = new Date();
    //var t2 = d2.getSeconds()*1000 + d2.getMilliseconds();
    //fb.trace("pl old apres="+t2+" ==> delta = "+Math.round(t2-t1)+" /list.hlist.length="+list.hlist.length);
};

//=================================================// Colour & Font Callbacks
function on_font_changed() {
    get_font();
    columns.duration_w = 0;
    columns.bitrate_w = 0;
    refresh_spv(plman.ActivePlaylist, true);
    window.Repaint();
};

function on_colors_changed() {
    get_colors();
    init_icons();
    redraw_stub_images();
    init_vscrollbar_buttons();
    set_scroller();
    g_image_cache = new image_cache;
    CollectGarbage();
    window.Repaint();
};

//=================================================// Init
function on_init() {   
    tf_group_key = fb.TitleFormat(group.key);
};
on_init();

//=================================================// OnSize
function on_size() {
    if (!window.Width || !window.Height) return;
    
    window.DlgCode = DLGC_WANTALLKEYS;
    
    bool_on_size = true;
    
    if(g_instancetype == 0) { // CUI
        window.MinWidth = 390;
        window.MinHeight = 100;  
    } else if(g_instancetype == 1) { // DUI
        window.MinWidth = 390;
        window.MinHeight = 100;
    };
    
    ww = window.Width;
    wh = window.Height;
    
    if(wh<100) wh = 100;
    
    // set wallpaper
    panel.wallpaper_img = FormatWP(gdi.Image(panel.wallpaper_path), ww, wh);
    
    get_font();
    get_colors();
    init_icons();
    
    recalc_datas();
    redraw_stub_images();
       
    // only on first launch
    if(list.first_launch) {
        list.first_launch = false;
        on_playlist_switch();
    } else {
        // if just a window resize, refresh list.item and repaint :)
        refresh_spv(plman.ActivePlaylist, true);
        vscrollbar.w = vscrollbar.visible?vscrollbar.default_w:0;
        window.Repaint();
    }
};

//=================================================// OnPaint
function on_paint(gr) {
        
    // default background
    if(panel.opacity>=255) {
        gr.FillSolidRect(0, 0, ww, wh, g_backcolor);
    } else {
        if(panel.show_wallpaper) {
            if(panel.wallpaper_img) {
                gr.FillSolidRect(0, 0, ww, wh, g_backcolor);
                gr.DrawImage(panel.wallpaper_img, 0, 0, ww, wh, 0, 0, panel.wallpaper_img.Width, panel.wallpaper_img.Height, 0, 255-panel.opacity);
            } else {
                gr.FillSolidRect(0, 0, ww, wh, RGBA(g_backcolor_R, g_backcolor_G, g_backcolor_B, panel.opacity));
            };
        } else {
            gr.FillSolidRect(0, 0, ww, wh, RGBA(g_backcolor_R, g_backcolor_G, g_backcolor_B, panel.opacity));
        };    
    };

    // draw items
    if(list.total>0){
        g_playing_item_y = null;
        var draw_limit = list.tocut+list.nbvis+group.nbrows+1;
        if(draw_limit>list.item.length) draw_limit = list.item.length;
        for(var idx=list.tocut;idx<draw_limit;idx++) {
            list.item[idx].draw(gr, list.item[idx].id, idx);
        };
    } else {
        vscrollbar.visible = false;
        vscrollbar.w = 0;

        if(fb.PlaylistCount>0) {
            var text_top = fb.GetPlaylistName(plman.ActivePlaylist);
			var text_bot = "這個播放清單是空的"
        } else {
            var text_top = "Br3tt's WSH Playlist Viewer";
			var text_bot = "新增播放清單以開始"
        };
        // if empty playlist, display text info
        gr.SetTextRenderingHint(5);
        gr.DrawString(text_top, gdi.Font("Segoe UI", 17, 0), g_textcolor&0x40ffffff, 0, toolbar.h-20, ww, wh, cc_stringformat);
        gr.DrawString(text_bot, gdi.Font("Segoe UI", 13, 0), g_textcolor&0x40ffffff, 0, toolbar.h+20, ww, wh, cc_stringformat);
        gr.FillGradRect(40, toolbar.h+Math.floor(wh/2), ww-80, 1, 0, 0, g_textcolor&0x40ffffff, 0.5);

    };

    // draw vscrollbar
    if(vscrollbar.visible && vscrollbar.show) {
        // draw scrollbar background
        try {
            vscrollbar.theme.SetPartAndStateId(6, 1);
            vscrollbar.theme.DrawThemeBackground(gr, ww-vscrollbar.w, 0, vscrollbar.w, wh);
        } catch(e) {
            //gr.FillGradRect(ww-vscrollbar.w, 0, vscrollbar.w, wh, 0, RGBA(0,0,0,10), RGBA(255,255,255,5), 0.5);
            gr.FillSolidRect(ww-vscrollbar.w, 0, 1, wh, RGBA(0,0,0,20));
        };
        
        // draw cursor
        cursor.bt.draw(gr, ww-vscrollbar.w, cursor.y, 255);
        
        try {
            vscrollbar.theme.SetPartAndStateId(9, 1);
            vscrollbar.theme.DrawThemeBackground(gr, ww-vscrollbar.w, cursor.y, cursor.w, cursor.h);
        } catch(e) {};
        
        // draw scrollbar buttons (up/down)
        for(i=0;i<vscrollbar.arr_buttons.length;i++) {
            switch (i) {
             case 0:
                vscrollbar.arr_buttons[i].draw(gr, ww-vscrollbar.w, button_up.y, 255);
                break;
             case 1:
                vscrollbar.arr_buttons[i].draw(gr, ww-vscrollbar.w, button_down.y, 255);
                break;
            };
        };
        
        if(cursor.drag) {
            vscrollbar.letter = list.item[list.tocut].group_key.substring(0,1).toUpperCase();
            cursor.popup && gr.DrawImage(cursor.popup, ww-vscrollbar.w-cursor.popup.Width, cursor.y+Math.floor(cursor.h/2)-Math.floor(cursor.popup.Height/2), cursor.popup.Width, cursor.popup.Height, 0, 0, cursor.popup.Width, cursor.popup.Height, 0, 155);
            cursor.popup && gr.GdiDrawText(vscrollbar.letter, gdi.Font("segoe ui", 14, 0), g_backcolor, ww-vscrollbar.w-cursor.popup.Width, cursor.y+Math.floor(cursor.h/2)-Math.floor(cursor.popup.Height/2), cursor.popup.Width-5, cursor.popup.Height, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
        };
    };
    
    if(panel.show_shadow_border) {
        // vertical left borders (Sunken effect)
        gr.FillSolidRect(0, toolbar.h-1, 1, wh+1, RGBA(0,0,0,30));
        gr.FillSolidRect(1, toolbar.h-1, 1, wh+1, RGBA(0,0,0,15));
        gr.FillSolidRect(2, toolbar.h-1, 1, wh+1, RGBA(0,0,0,5));
        // and the right one, only if scrollbar is hidden
        if(!vscrollbar.visible || !vscrollbar.show) {
            gr.FillSolidRect(ww-vscrollbar.w-1, toolbar.h-1, 1, wh+1, RGBA(0,0,0,30));
            gr.FillSolidRect(ww-vscrollbar.w-2, toolbar.h-1, 1, wh+1, RGBA(0,0,0,15));
            gr.FillSolidRect(ww-vscrollbar.w-3, toolbar.h-1, 1, wh+1, RGBA(0,0,0,5));
        } else {
            gr.FillSolidRect(ww-vscrollbar.w-1, toolbar.h-1, 1, wh+1, RGBA(0,0,0,10));
            gr.FillSolidRect(ww-vscrollbar.w-2, toolbar.h-1, 1, wh+1, RGBA(0,0,0,5));
        };
        // top border
        gr.FillSolidRect(0, 0, ww-vscrollbar.w, 1, RGBA(0,0,0,30));
        gr.FillSolidRect(1, 1, ww-vscrollbar.w, 1, RGBA(0,0,0,15));
        gr.FillSolidRect(2, 2, ww-vscrollbar.w, 1, RGBA(0,0,0,5));
        // bot border
        gr.FillSolidRect(0, wh-1, ww-vscrollbar.w, 1, RGBA(0,0,0,30));
        gr.FillSolidRect(1, wh-2, ww-vscrollbar.w, 1, RGBA(0,0,0,15));
        gr.FillSolidRect(2, wh-3, ww-vscrollbar.w, 1, RGBA(0,0,0,5));
    };

    // Incremental Search Tooltip
    if(g_search_string.length>0) {
        gr.SetSmoothingMode(2);
        var tt_x = Math.floor(((ww-vscrollbar.w) / 2) - (((g_search_string.length*13)+(10*2)) / 2));
        var tt_y = Math.floor((wh/2) - 30);
        //var tt_w = Math.round((g_search_string.length*13)+(10*2));
        var tt_w = gr.CalcTextWidth(g_search_string, incsearch_font_big) + 8;
        var tt_h = 60;
        gr.FillRoundRect(tt_x, tt_y, tt_w, tt_h, 5, 5, RGBA(0,0,0,150));
        gr.DrawRoundRect(tt_x, tt_y, tt_w, tt_h, 5, 5, 2.0, RGBA(255,255,255,200));
        gr.DrawRoundRect(tt_x+2, tt_y+2, tt_w-4, tt_h-4, 3, 3, 1.0, RGBA(0,0,0,150));
        gr.GdiDrawText(g_search_string, incsearch_font_big, RGB(0,0,0), tt_x+1, tt_y+1 , tt_w , tt_h, DT_CENTER | DT_NOPREFIX | DT_CALCRECT | DT_VCENTER);
        gr.GdiDrawText(g_search_string, incsearch_font_big, list.inc_search_noresult?RGB(255,75,75):RGB(250,250,250), tt_x, tt_y , tt_w , tt_h, DT_CENTER | DT_NOPREFIX | DT_CALCRECT | DT_VCENTER);
    };
    
    if(list.total>0){
        var txt;
        var columns_w = ww-(columns.playicon_w+columns.tracknumber_w);
        if(!g_font) g_font = gdi.Font("tahoma", 11);
        for(var idx=list.tocut;idx<draw_limit;idx++) {
            if(list.item[idx].showtooltip) {
                if(group.nbrows==0 || (columns.title==1 && list.item[idx].artist!=list.item[idx].albumartist) || columns.title==2) {
                    txt = list.item[idx].title+" "+panel.tag_separator+" "+list.item[idx].artist;
                } else {
                    txt = list.item[idx].title;
                };
                if(txt && txt.length>0) {
                    var txt_w = gr.CalcTextWidth(txt, g_font);
                    var txt_h = gr.CalcTextHeight(txt, g_font);
                    var txt_wrap = gr.EstimateLineWrap(txt, g_font, columns_w).toArray();
                    var txt_lines = 0;
                    for (i=1; i<txt_wrap.length; i=i+2) {
                        txt_lines = txt_lines + 1;
                    }
                    gr.FillRoundRect(columns.title_x-6, list.item[idx].y+txt_h*txt_lines+6>wh?wh-txt_h*txt_lines-6:list.item[idx].y, txt_w>columns_w?columns_w+2:txt_w+10, txt_h*txt_lines+6, 3, 3, g_textcolor&0xd0ffffff);
                    gr.DrawRoundRect(columns.title_x-6, list.item[idx].y+txt_h*txt_lines+6>wh?wh-txt_h*txt_lines-6:list.item[idx].y, txt_w>columns_w?columns_w+2:txt_w+10, txt_h*txt_lines+6, 3, 3, 1.2, RGBA(16,16,16,128));
                    gr.DrawString(txt, g_font, g_backcolor, columns.title_x, list.item[idx].y+txt_h*txt_lines+6>wh?wh-txt_h*txt_lines-6:list.item[idx].y, txt_w>columns_w-6?columns_w-6:txt_w+6, txt_h*txt_lines+6, lc_stringformat);
                };
            };
        };
    };
    
    // draw toolbar
    if(!toolbar.state && !toolbar.timerID1) {
        // draw marker to indicate toolbar expandable
        gr.DrawLine(Math.floor((ww-vscrollbar.w)/2)-3, 2, Math.floor((ww-vscrollbar.w)/2)+3, 2, 1.0, g_textcolor&0x44ffffff);
        gr.DrawLine(Math.floor((ww-vscrollbar.w)/2)-2, 3, Math.floor((ww-vscrollbar.w)/2)+0, 5, 1.0, g_textcolor&0x44ffffff);
        gr.DrawLine(Math.floor((ww-vscrollbar.w)/2)+2, 3, Math.floor((ww-vscrollbar.w)/2)+1, 4, 1.0, g_textcolor&0x44ffffff);
    }
    if(toolbar.state || toolbar.timerID1) {
        gr.SetSmoothingMode(2);
        gr.FillRoundRect(09, (toolbar.collapsed_y + toolbar.delta) - 10, ww-vscrollbar.w-20 + 2, Math.abs(toolbar.collapsed_y) + 10 + 1, 6, 6, RGBA(0,0,0,60));
        gr.FillRoundRect(10, (toolbar.collapsed_y + toolbar.delta) - 10, ww-vscrollbar.w-20, Math.abs(toolbar.collapsed_y) + 10, 5, 5, RGBA(0,0,0,190));
        gr.DrawRoundRect(11, (toolbar.collapsed_y + toolbar.delta) - 10, ww-vscrollbar.w-20-2, Math.abs(toolbar.collapsed_y) + 10-1, 4, 4, 1.0, RGBA(250,250,250,40));
        gr.SetSmoothingMode(0);
        // draw toolbar buttons
        for(i=0;i<toolbar.buttons.length;i++) {
            switch (i) {
             case 0:
                toolbar.buttons[i].draw(gr, 16, (toolbar.collapsed_y + toolbar.delta) + 3, 255);
                break;
             case 1:
                toolbar.buttons[i].draw(gr, ww-vscrollbar.w-30-15, (toolbar.collapsed_y + toolbar.delta) + 3, 255);
                break;
            };
        };
    };
};

//=================================================// Mouse Callbacks
function on_mouse_lbtn_down(x, y) {

    g_drag = true;
    
    bool_on_size = false;
    
    var act_pls = plman.ActivePlaylist;
    
    // check toolbar buttons
    if(toolbar.state) {
        for(var j=0;j<toolbar.buttons.length;j++) {
            toolbar.buttons[j].checkstate("down", x, y);
        };
    };
    if(y>toolbar.delta) {
        // check items
        var len = list.item.length;
        row.buttons_hover = false;
        for(var i=0;i<len;i++) {
            list.item[i].checkstate("down", x, y, i);
        };
    };
    
    // check scrollbar
    if(vscrollbar.visible && vscrollbar.show) {
        if(cursor.bt.checkstate("down", x, y)==ButtonStates.down) {
            cursor.drag = true;
            cursor.grap_y = y - cursor.y;
            cursor.last_y = cursor.y;
        };
        if(vscrollbar.hover && !cursor.drag) {
            vscrollbar.step = list.nbvis;
            if(y<cursor.y) {
                if(!list.buttonclicked) {
                    list.buttonclicked = true;
                    on_mouse_wheel(vscrollbar.step);
                    scrollbarbt.timerID1 = window.SetTimeout(function () {
                        on_mouse_wheel(vscrollbar.step);
                        scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                        scrollbarbt.timerID1 = false;
                        scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                        scrollbarbt.timerID2 = window.SetInterval(function () {
                            if(vscrollbar.hover) {
                                if(mouse_x>ww-vscrollbar.w && cursor.y > mouse_y) {
                                    on_mouse_wheel(vscrollbar.step);
                                };
                            };
                        }, scrollbarbt.timer2_value+30);
                    }, scrollbarbt.timer1_value);
                };
            } else {
                if(!list.buttonclicked) {
                    list.buttonclicked = true;
                    on_mouse_wheel(-1*vscrollbar.step);
                    scrollbarbt.timerID1 = window.SetTimeout(function () {
                        on_mouse_wheel(-1*vscrollbar.step);
                        scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                        scrollbarbt.timerID1 = false;
                        scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                        scrollbarbt.timerID2 = window.SetInterval(function () {
                            if(vscrollbar.hover) {
                                if(mouse_x>ww-vscrollbar.w && cursor.y+cursor.h < mouse_y) {
                                    on_mouse_wheel(-1*vscrollbar.step);
                                };
                            };
                        }, scrollbarbt.timer2_value+30);
                    }, scrollbarbt.timer1_value);
                };
            };
        };
        // check other vscrollbar buttons
        for(i=0;i<vscrollbar.arr_buttons.length;i++) {
            switch(i) {
             case 0:
                if(vscrollbar.arr_buttons[i].checkstate("down", x, y)==ButtonStates.down) {
                    if(!list.buttonclicked) {
                        list.buttonclicked = true;
                        scrollup_spv(act_pls, 1);
                        window.Repaint();
                        scrollbarbt.timerID1 = window.SetTimeout(function () {
                            reset_cover_timers();
                            scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                            scrollbarbt.timerID1 = false;
                            scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                            scrollbarbt.timerID2 = window.SetInterval(function () {
                                scrollup_spv(act_pls, 1);
                                window.Repaint();
                            }, scrollbarbt.timer2_value);
                        }, scrollbarbt.timer1_value);
                    };
                };
                break;
             case 1:
                if(vscrollbar.arr_buttons[i].checkstate("down", x, y)==ButtonStates.down) {
                    if(!list.buttonclicked) {
                        list.buttonclicked = true;
                        scrolldown_spv(act_pls, 1);
                        window.Repaint();
                        scrollbarbt.timerID1 = window.SetTimeout(function () {
                            reset_cover_timers();
                            scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                            scrollbarbt.timerID1 = false;
                            scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                            scrollbarbt.timerID2 = window.SetInterval(function () {
                                scrolldown_spv(act_pls, 1);
                                window.Repaint();
                            }, scrollbarbt.timer2_value);
                        }, scrollbarbt.timer1_value);
                    };
                };
                break;
            };
        };
    };
};

function on_mouse_lbtn_dblclk(x, y, mask) {

    if(y<toolbar.delta) {
        ShowNowPlaying();
    } else if(x<ww-vscrollbar.w) {
        var len = list.item.length;
        row.buttons_hover = false;
        for(var i=0;i<len;i++) {
            list.item[i].checkstate("dblclk", x, y, i);
        };
    } else {
        on_mouse_lbtn_down(x, y);
    };
};

function on_mouse_lbtn_up(x, y) {
    
    vscrollbar.step = vscrollbar.default_step;

    // scrollbar button up and down RESET
    list.buttonclicked = false;
    scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
    scrollbarbt.timerID1 = false;
    scrollbarbt.timerID2 && window.ClearTimeout(scrollbarbt.timerID2);
    scrollbarbt.timerID2 = false;

    // check toolbar buttons
    if(toolbar.state) {
        for(i=0;i<list.item.length;i++) {
            if (list.item[i].showtooltip) list.item[i].showtooltip = false;
        };
        for(var j=0;j<toolbar.buttons.length;j++) {
            switch(j) {
                case 0:
                    if(toolbar.buttons[j].checkstate("up", x, y)==ButtonStates.hover) {
                        g_menu_displayed = true;
                        settings_menu(x, y);
                    };
                    break;
                case 1:
                    if(toolbar.buttons[j].checkstate("up", x, y)==ButtonStates.hover) {
                        g_menu_displayed = true;
                        sort_group_menu(x, y);
                    };
                    break;
            };
        };
    };

    if(list.total>0) {
      
        // check scrollbar buttons
        cursor.bt.checkstate("up", x, y);
        for(i=0;i<vscrollbar.arr_buttons.length;i++) {
            vscrollbar.arr_buttons[i].checkstate("up", x, y);
        };
        
        if(cursor.drag) {
            window.RepaintRect(ww-vscrollbar.w-cursor.popup.Width-5, 0, cursor.popup.Width+vscrollbar.w+5, wh);
            cursor.drag = false;
            //setcursory();
        } else {
            // check items
            var len = list.item.length;
            row.buttons_hover = false;
            for(i=0;i<len;i++) {
                list.item[i].checkstate("up", x, y, i);
                if (list.item[i].showtooltip) list.item[i].showtooltip = false;
            };
        };
        window.Repaint();
    };


    // Drop items after a drag'n drop outside the playlist (e.g. to a WSH playlist tab manager panel)
    if(dragndrop.drag_out) {
        if(!panel.ishover) {
            window.NotifyOthers("WSH_playlist_drag_drop", list.metadblist_selection);
            dragndrop.drag_out = false;
        };
    };
    // Drop items after a drag'n drop inside the panel playlist
    if(dragndrop.drag_in) {
        if(panel.ishover && dragndrop.drag_id>=0 && dragndrop.drop_id>=0){
            var nb_selected_items = list.metadblist_selection.Count;
            if(dragndrop.drop_id > dragndrop.drag_id) {
                // on pointe sur le dernier item de la selection si on move vers le bas
                var new_drag_pos = list.handlelist.Find(list.metadblist_selection.item(nb_selected_items-1));
            } else {
                // on pointe sur le 1er item de la selection si on move vers le haut
                var new_drag_pos = list.handlelist.Find(list.metadblist_selection.item(0));
            };
            var move_delta = dragndrop.drop_id - new_drag_pos;
            plman.MovePlaylistSelection(plman.ActivePlaylist, move_delta);
        };
    };
    dragndrop.drag_id = -1;
    dragndrop.drop_id = -1;
    dragndrop.drag_in = false;
    dragndrop.drag_out = false;
    dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
    dragndrop.timerID = false;
    window.SetCursor(IDC_ARROW);
    
    g_drag = false;
    
    // toolbar collapse if mouse out after a lbtn up
    if(!toolbar.lock) {
        if(y>30 || x<10 || x>ww-vscrollbar.w-10) {
            if(toolbar.delta==0) {
                toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
                toolbar.timerID_on = false;
            };
            if(toolbar.state) {
                if(!toolbar.timerID_off) {
                    if(toolbar.delta == toolbar.collapsed_y*-1) {
                        toolbar.timerID_off = window.SetTimeout(function() {
                            if(!toolbar.timerID2) {
                                toolbar.timerID2 = window.SetInterval(function() {
                                    toolbar.delta -= toolbar.step;
                                    if(toolbar.delta <= 0) {
                                        toolbar.delta = 0;
                                        toolbar.state = false;
                                        window.ClearInterval(toolbar.timerID2);
                                        toolbar.timerID2 = false;
                                    };
                                    window.RepaintRect(0, 0, ww, 30);
                                }, 30);
                            } ;
                            toolbar.timerID_off && window.ClearTimeout(toolbar.timerID_off);
                            toolbar.timerID_off = false;
                        }, 400);
                    };
                };   
            };
        };
    };
};

function on_mouse_rbtn_down(x, y) {
    
    bool_on_size = false;
    
    var len = list.item.length;
    row.buttons_hover = false;
    for(var i=0;i<len;i++) {
        if(list.item[i].showtooltip) list.item[i].showtooltip = false;
        if(list.item[i].checkstate("right", x, y, i)==-1) break;
    };
};

function on_mouse_rbtn_up(x, y) {
    if(!utils.IsKeyPressed(VK_SHIFT)) {
        return true;
    };
};

function on_mouse_move(x, y) {
    var txt = "";
    //show_tooltip = false;
    
    if(x==mouse_x && y==mouse_y) return true;
    
    var act_pls = plman.ActivePlaylist;
    
    panel.ishover = (x>=0 && x<=ww && y>=0 && y<=wh);
    if(dragndrop.enabled && (dragndrop.drag_in || dragndrop.drag_out)) window.SetCursor(IDC_HELP); else window.SetCursor(IDC_ARROW);

    if(y>toolbar.delta) {
        var len = list.item.length;
        var move_limit = list.tocut+list.nbvis+group.nbrows+1;
        if(move_limit>len) move_limit = len;
        row.buttons_hover = false;
        for(var j=list.tocut;j<move_limit;j++) {
            list.item[j].checkstate("move", x, y, j);
            if(list.item[j].ishover && x>columns.title_x && x<columns.title_x+columns.title_w) {
                if(group.nbrows==0 || (columns.title==1 && list.item[j].artist!=list.item[j].albumartist) || columns.title==2) {
                    txt = list.item[j].title+" "+panel.tag_separator+" "+list.item[j].artist;
                } else {
                    txt = list.item[j].title;
                };
                if(txt) {
                    //if(txt.length>0 && list.item[j].tooltip && !g_tooltip_timer) {
                    if(txt.length>0 && list.item[j].tooltip && moved!=j) {
                        //show_tooltip = true;
                        list.item[j].showtooltip = true;
                        moved = j;
                        window.Repaint();
                    }
                };
                //if(g_tooltip.Text != txt) {     
                    //g_tooltip.Deactivate();
                    //g_tooltip.TrackActivate = true;
                    //g_tooltip.Text = txt ? txt : "";
                    //g_tooltip.TrackPosition(columns.title_x-6, list.item[j].y+Math.floor(row.h/2)-(18/2));
                    //g_tooltip.TrackPosition(columns.title_x+4, list.item[j].y+row.h-2);
                //};
            } else {
                if(list.item[j].tooltip) {
                    list.item[j].showtooltip = false;
                    if (moved==j) moved = -1;
                    window.Repaint();
                };
            };
        };
    } else {
        // check toolbar buttons
        if(toolbar.state) {
            for(j=0;j<toolbar.buttons.length;j++) {
                toolbar.buttons[j].checkstate("move", x, y);
            };
        };
    };

    //if(show_tooltip) {
        //g_tooltip.Activate();
        //g_tooltip.TrackActivate = true;
    //} else {
        //g_tooltip.Deactivate();
        //g_tooltip.TrackActivate = false;
        //g_tooltip.Text="";
    //}
    
    if(list.item.length>0 && vscrollbar.visible && vscrollbar.show) {
        vscrollbar.hover = (x>=ww-vscrollbar.w && x<=ww && y>=vscrollbar.y && y<=vscrollbar.y+vscrollbar.h);
        cursor.hover = (x>=cursor.x && x<=cursor.x+cursor.w && y>=cursor.y && y<=cursor.y+cursor.h);
        // check buttons
        cursor.bt.checkstate("move", x, y);
               
        for(var i=0;i<vscrollbar.arr_buttons.length;i++) {
            vscrollbar.arr_buttons[i].checkstate("move", x, y);
        };
        if(cursor.drag && mouse_y!=y) {
            reset_cover_timers();
            cursor.y = y - cursor.grap_y;
            // check boundaries
            if(cursor.y<vscrollbar.y) cursor.y = vscrollbar.y;
            if(cursor.y>vscrollbar.y+vscrollbar.h-cursor.h) cursor.y = vscrollbar.y+vscrollbar.h-cursor.h;
            if(!cursor.timerID) {
                cursor.timerID = window.SetTimeout(function() {
                    refresh_spv_cursor(act_pls);
                    window.Repaint();
                    cursor.timerID && window.ClearTimeout(cursor.timerID);
                    cursor.timerID = false;
                }, 30);
            };
        };
    };
    
    //show_tooltip = false;
    
    if(dragndrop.drag_in) {
        if(y<toolbar.h && y > toolbar.h-row.h) {
            if(!list.buttonclicked) {
                list.buttonclicked = true;
                scrollbarbt.timerID1 = window.SetInterval(function () {
                    reset_cover_timers();
                    for(i=0;i<list.mousewheel_scrollstep;i++) {
                        scrollup_spv(act_pls, 1);
                    };
                    window.Repaint();
                }, 100);
            };
        } else if(y>wh && y < wh+row.h) {
            if(!list.buttonclicked) {
                list.buttonclicked = true;
                scrollbarbt.timerID1 = window.SetInterval(function () {
                    reset_cover_timers();
                    for(i=0;i<list.mousewheel_scrollstep;i++) {
                        scrolldown_spv(act_pls, 1);
                    };
                    window.Repaint();
                }, 100);
            };
        } else {
            scrollbarbt.timerID1 && window.ClearInterval(scrollbarbt.timerID1);
            scrollbarbt.timerID1 = false;
            list.buttonclicked = false;
            if(Math.floor((y-toolbar.h)/row.h)!=Math.floor((mouse_y-toolbar.h)/row.h)) {
                if(!dragndrop.timerID) {
                    dragndrop.timerID = window.SetTimeout(function() {
                        window.Repaint();
                        dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
                        dragndrop.timerID = false;
                    }, 30);
                };
            };
        };
    };
    
    // hide/show toolbar
    if(!toolbar.lock && !g_drag) {
        if(y>=0 && y<=15 && x>10 && x<ww-vscrollbar.w-10) {
            if(!row.buttons_hover && !dragndrop.drag_in && !dragndrop.drag_out) {
                if(toolbar.delta==toolbar.collapsed_y*-1) {
                    toolbar.timerID_off && window.ClearTimeout(toolbar.timerID_off);
                    toolbar.timerID_off = false;
                };
                if(!toolbar.timerID_on) {
                    if(toolbar.delta==0) {
                        toolbar.timerID_on = window.SetTimeout(function() {
                            toolbar.timerID2 && window.ClearInterval(toolbar.timerID2);
                            toolbar.timerID2 = false;
                            if(!toolbar.timerID1) {
                                toolbar.timerID1 = window.SetInterval(function() {
                                    toolbar.delta += toolbar.step;
                                    if(toolbar.collapsed_y + toolbar.delta >= 0) {
                                        toolbar.delta = toolbar.collapsed_y*-1;
                                        toolbar.state = true;
                                        window.ClearInterval(toolbar.timerID1);
                                        toolbar.timerID1 = false;
                                    };
                                    window.RepaintRect(0, 0, ww, 30);
                                }, 30);
                            };
                            toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
                            toolbar.timerID_on = false;
                        }, 400);
                    } else if(toolbar.timerID2) {
                        toolbar.timerID2 && window.ClearInterval(toolbar.timerID2);
                        toolbar.timerID2 = false;
                        if(!toolbar.timerID1) {
                            toolbar.timerID1 = window.SetInterval(function() {
                                toolbar.delta += toolbar.step;
                                if(toolbar.collapsed_y + toolbar.delta >= 0) {
                                    toolbar.delta = toolbar.collapsed_y*-1;
                                    toolbar.state = true;
                                    window.ClearInterval(toolbar.timerID1);
                                    toolbar.timerID1 = false;
                                };
                                window.RepaintRect(0, 0, ww, 30);
                            }, 30);
                        };
                    };
                };
            };
        } else if(y>30 || x<10 || x>ww-vscrollbar.w-10) {
            if(toolbar.delta==0) {
                toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
                toolbar.timerID_on = false;
            };
            if(toolbar.state) {
                if(!toolbar.timerID_off) {
                    if(toolbar.delta == toolbar.collapsed_y*-1) {
                        toolbar.timerID_off = window.SetTimeout(function() {
                            if(!toolbar.timerID2) {
                                toolbar.timerID2 = window.SetInterval(function() {
                                    toolbar.delta -= toolbar.step;
                                    if(toolbar.delta <= 0) {
                                        toolbar.delta = 0;
                                        toolbar.state = false;
                                        window.ClearInterval(toolbar.timerID2);
                                        toolbar.timerID2 = false;
                                    };
                                    window.RepaintRect(0, 0, ww, 30);
                                }, 30);
                            } ;
                            toolbar.timerID_off && window.ClearTimeout(toolbar.timerID_off);
                            toolbar.timerID_off = false;
                        }, 400);
                    };
                };   
            };
        };
    };
   
    mouse_x = x;
    mouse_y = y;
};

function on_mouse_wheel(delta) {
    
    //g_tooltip.Text="";
     
    reset_cover_timers();
    var act_pls = plman.ActivePlaylist;
    var abs_delta = Math.abs(delta);
    if(abs_delta==1) {
        if(delta>0) {
            for(var i=0;i<list.mousewheel_scrollstep;i++) {
                scrollup_spv(act_pls, 1);
            };
            window.Repaint();
        } else {
            for(var i=0;i<list.mousewheel_scrollstep;i++) {
                scrolldown_spv(act_pls, 1);
            };
            window.Repaint();
        };
    } else if(delta>0) {
        for(i=0;i<delta;i++) {
            scrollup_spv(act_pls, 1);
        };
        window.Repaint();
    } else {
        for(i=0;i<abs_delta;i++) {
            scrolldown_spv(act_pls, 1);
        };
        window.Repaint();
    };
};

function on_mouse_leave() {
    
    // reset tooltip
    //g_tooltip.Deactivate();
    //g_tooltip.TrackActivate = false;
    //g_tooltip.Text="";

    // check buttons
    if(list.total>0) {
        cursor.bt.checkstate("leave", 0, 0);
    };
    for(var i in vscrollbar.arr_buttons) {
        vscrollbar.arr_buttons[i].checkstate("leave", 0, 0);
    };
    for(var j in toolbar.buttons) {
        toolbar.buttons[j].checkstate("leave", 0, 0);
    };

    var len = list.item.length;
    row.buttons_hover = false;
    for(i=0;i<len;i++) {
        list.item[i].checkstate("leave", 0, 0, i);
    };

    // toolbar is to hide if visible or amorced
    if(toolbar.delta==0) {
        toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
        toolbar.timerID_on = false;
    };
    if(!toolbar.lock && !g_drag) {
        if(!g_menu_displayed) {
            if(!toolbar.timerID_off) {
                toolbar.timerID_off = window.SetTimeout(function() {
                    if(!toolbar.timerID2) {
                        toolbar.timerID2 = window.SetInterval(function() {
                            toolbar.delta -= toolbar.step;
                            if(toolbar.delta <= 0) {
                                toolbar.delta = 0;
                                toolbar.state = false;
                                window.ClearInterval(toolbar.timerID2);
                                toolbar.timerID2 = false;
                            };
                            window.RepaintRect(0, 0, ww, 30);
                        }, 30);
                    } ;
                    toolbar.timerID_off && window.ClearTimeout(toolbar.timerID_off);
                    toolbar.timerID_off = false;
                }, 400);
            };   
        };
    };
    
    window.Repaint();
};

//=================================================// Callbacks

function refresh_playlist_content() {
    init_active_pls();
    var act_pls = plman.ActivePlaylist;
    list.focus_id = plman.GetPlaylistFocusItemIndex(act_pls);
    refresh_spv(act_pls, true);
    vscrollbar.w = vscrollbar.visible?vscrollbar.default_w:0;
    window.Repaint();
};

function on_playlist_switch() {
    if(isQueuePlaylistActive()) {
        ShowPlaylistQueue(0);
    } else {
        // test if there is an active playlist focused (may happen whenyou delete a playlist from pl manager)
        var act_pls = plman.ActivePlaylist;
        var pls_count = plman.PlaylistCount;
        if(act_pls < 0 || act_pls > pls_count) {
            if(pls_count>0) {
                act_pls = 0;
                plman.ActivePlaylist = 0;
            };
        };
        refresh_playlist_content();
    };
};

function on_playlist_items_added(playlist_idx) {
    if(playlist_idx==plman.ActivePlaylist) {
        // timer to avoid freeze due to many tracks added at the same time, with this tweaks, refresh will be done when last item added only!
        if(g_add_items_timerID) {
            g_add_items_timerID && window.ClearTimeout(g_add_items_timerID);
            g_add_items_timerID = false;
        } else {
            g_add_items_timerID = window.SetTimeout(function() {
                refresh_playlist_content();
                plman.SetActivePlaylistContext();
                g_add_items_timerID && window.ClearTimeout(g_add_items_timerID);
                g_add_items_timerID = false;
            }, 250);
        };
    };
};

function on_playlist_items_removed(playlist_idx, new_count) {
    if(playlist_idx==plman.ActivePlaylist) {
        refresh_playlist_content();
    };
    plman.SetActivePlaylistContext();
};

function on_playlist_items_reordered(playlist_idx) {
    if(playlist_idx==plman.ActivePlaylist) {
        refresh_playlist_content();
    };
};

function on_selection_changed(metadb) {
};

function on_playlist_items_selection_change() {
    window.Repaint();
};

function on_item_focus_change(playlist, from, to) {
    if(!ww || !wh) return true;
    if(to<0) { // after a remove item in playlist!
        return true;
    };
    if(playlist!=plman.ActivePlaylist) { // case of the item played was from the queue but was the last queued so now queue is empty
        return true;
    };
    list.focus_id = to;
    plman.SetActivePlaylistContext();
    refresh_spv(plman.ActivePlaylist, bool_on_size);
    bool_on_size = false;
    window.Repaint();
};

function on_metadb_changed(metadb_or_metadbs, fromhook) {
    var len = list.item.length;
    for(var i=0;i<len;i++) {
        list.item[i].update_infos();
    };
    window.Repaint();
};

//function on_focus(is_focused) {
//    if(is_focused) {
//        plman.SetActivePlaylistContext();
//    } else {
//        g_tooltip.Deactivate();
//        g_tooltip.TrackActivate = false;
//        g_tooltip.Text="";
//        g_tooltip_timer && window.ClearTimeout(g_tooltip_timer);
//        g_tooltip_timer = window.SetTimeout(function() {
//            g_tooltip_timer && window.ClearTimeout(g_tooltip_timer);
//            g_tooltip_timer = false;
//        }, 500);
//    };
//};

//=================================================// Keyboard Callbacks
function on_key_up(vkey) {
    vscrollbar.step = vscrollbar.default_step;
    // scroll keys up and down RESET (step and timers)
    list.keypressed = false;
    scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
    scrollbarbt.timerID1 = false;
    scrollbarbt.timerID2 && window.ClearTimeout(scrollbarbt.timerID2);
    scrollbarbt.timerID2 = false;
    if(vkey==VK_SHIFT) {
        list.SHIFT_start_id = null;
        list.SHIFT_count = 0;
    };
};

function on_key_down(vkey) {
    
    if(dragndrop.drag_in) return true;
    
    var mask = GetKeyboardMask();
    var act_pls = plman.ActivePlaylist;
    
    if (mask == KMask.none) {
        switch (vkey) {
        case VK_SHIFT:
            list.SHIFT_count = 0;
            break;
        case VK_BACK:
            if(g_search_string.length>0) {
                var tt_x = ((ww-vscrollbar.w) / 2) - (((g_search_string.length*13)+(10*2)) / 2);
                var tt_y = (wh/2) - 30;
                var tt_w = ((g_search_string.length*13)+(10*2));
                var tt_h = 60;
                g_search_string = g_search_string.substring(0, g_search_string.length-1);
                window.RepaintRect(0, tt_y-2, ww-vscrollbar.w, tt_h+4);
                clear_incsearch_timer && window.ClearInterval(clear_incsearch_timer);
                incsearch_timer && window.ClearTimeout(incsearch_timer);
                incsearch_timer = window.SetTimeout(function () {
                    IncrementalSearch();
                    incsearch_timer = false;
                }, 400);
            };
            break;
        case VK_ESCAPE:
        case 222:
            var tt_x = ((ww-vscrollbar.w) / 2) - (((g_search_string.length*13)+(10*2)) / 2);
            var tt_y = (wh/2) - 30;
            var tt_w = ((g_search_string.length*13)+(10*2));
            var tt_h = 60;
            g_search_string = "";
            window.RepaintRect(0, tt_y-2, ww-vscrollbar.w, tt_h+4);
            break;
        case VK_UP:
            var new_focus_id = 0;
            if(!list.keypressed) {
                list.keypressed = true;
                reset_cover_timers();
                new_focus_id = (list.focus_id>0)?list.focus_id-1:0;
                plman.SetPlaylistFocusItem(act_pls, new_focus_id);
                plman.ClearPlaylistSelection(act_pls);
                plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
                scrollbarbt.timerID1 = window.SetTimeout(function () {
                    scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                    scrollbarbt.timerID1 = false;
                    scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                    scrollbarbt.timerID2 = window.SetInterval(function () {
                        new_focus_id = (list.focus_id>0)?list.focus_id-1:0;
                        plman.SetPlaylistFocusItem(act_pls, new_focus_id);
                        plman.ClearPlaylistSelection(act_pls);
                        plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
                    }, scrollbarbt.timer2_value+5);
                }, scrollbarbt.timer1_value);
            }
            break;
        case VK_DOWN:
            var new_focus_id = 0;
            if(!list.keypressed) {
                list.keypressed = true;
                reset_cover_timers();
                new_focus_id = (list.focus_id<list.total-1)?list.focus_id+1:list.total-1;
                plman.SetPlaylistFocusItem(act_pls, new_focus_id);
                plman.ClearPlaylistSelection(act_pls);
                plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
                scrollbarbt.timerID1 = window.SetTimeout(function () {
                    scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                    scrollbarbt.timerID1 = false;
                    scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                    scrollbarbt.timerID2 = window.SetInterval(function () {
                        new_focus_id = (list.focus_id<list.total-1)?list.focus_id+1:list.total-1;
                        plman.SetPlaylistFocusItem(act_pls, new_focus_id);
                        plman.ClearPlaylistSelection(act_pls);
                        plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
                    }, scrollbarbt.timer2_value+5);
                }, scrollbarbt.timer1_value);
            };
            break;
        case VK_PGUP:
            var delta = 0;
            var step = 0;
            var new_focus_id = 0;
            if(!list.keypressed) {
                list.keypressed = true;
                reset_cover_timers();
                delta = list.tocut;
                step = list.focus_id - list.item[delta].id;
                new_focus_id = (list.focus_id-step-1>0)?list.focus_id-step-1:0;
                list.focus_id = new_focus_id;
                plman.ClearPlaylistSelection(act_pls);
                plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
                plman.SetPlaylistFocusItem(act_pls, new_focus_id);
                scrollbarbt.timerID1 = window.SetTimeout(function () {
                    scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                    scrollbarbt.timerID1 = false;
                    scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                    scrollbarbt.timerID2 = window.SetInterval(function () {
                        delta = list.tocut;
                        step = list.focus_id - list.item[delta].id;
                        new_focus_id = (list.focus_id-step-1>0)?list.focus_id-step-1:0;
                        plman.SetPlaylistFocusItem(act_pls, new_focus_id);
                        plman.ClearPlaylistSelection(act_pls);
                        plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
                    }, scrollbarbt.timer2_value+30);
                }, scrollbarbt.timer1_value);
            };
            break;
        case VK_PGDN:
            var delta = 0;
            var step = 0;
            var new_focus_id = 0;
            if(!list.keypressed) {
                list.keypressed = true;
                reset_cover_timers();
                delta = (list.tocut+list.nbvis<list.item.length)?list.tocut+list.nbvis:list.item.length-1;
                step = list.item[delta].id - list.focus_id;
                new_focus_id = (list.focus_id<list.total-1-step)?list.focus_id+step:list.total-1;
                list.focus_id = new_focus_id;
                plman.ClearPlaylistSelection(act_pls);
                plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
                plman.SetPlaylistFocusItem(act_pls, new_focus_id);
                scrollbarbt.timerID1 = window.SetTimeout(function () {
                    scrollbarbt.timerID1 && window.ClearTimeout(scrollbarbt.timerID1);
                    scrollbarbt.timerID1 = false;
                    scrollbarbt.timerID2 && window.ClearInterval(scrollbarbt.timerID2);
                    scrollbarbt.timerID2 = window.SetInterval(function () {
                        delta = (list.tocut+list.nbvis<list.item.length)?list.tocut+list.nbvis:list.item.length-1;
                        step = list.item[delta].id - list.focus_id;
                        new_focus_id = (list.focus_id<list.total-1-step)?list.focus_id+step:list.total-1;
                        plman.SetPlaylistFocusItem(act_pls, new_focus_id);
                        plman.ClearPlaylistSelection(act_pls);
                        plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
                    }, scrollbarbt.timer2_value+30);
                }, scrollbarbt.timer1_value);
            };
            break;
        case VK_RETURN:
            // play focus item
            if(!isQueuePlaylistActive()) {
                plman.ExecutePlaylistDefaultAction(act_pls, list.focus_id);
            };
            break;
        case VK_END:
            plman.SetPlaylistFocusItem(act_pls, list.total-1);
            plman.ClearPlaylistSelection(act_pls);
            plman.SetPlaylistSelectionSingle(act_pls, list.total-1, true);
            break;
        case VK_HOME:
            plman.SetPlaylistFocusItem(act_pls, 0);
            plman.ClearPlaylistSelection(act_pls);
            plman.SetPlaylistSelectionSingle(act_pls, 0, true);
            break;
        case VK_DELETE:
            if(!fb.IsAutoPlaylist(act_pls)) {
                if(isQueuePlaylistActive()) {
                    var affected_items = Array();
                    var first_focus_id = null;
                    var next_focus_id = null;
                    for(var k=0; k<list.total; k++) {
                        if(plman.IsPlaylistItemSelected(act_pls, k)) {
                            affected_items.push(k);
                            if(first_focus_id==null) fist_focus_id = k;
                            next_focus_id = k + 1;
                        };
                    };
                    if(next_focus_id>=list.total) {
                        next_focus_id = fist_focus_id;
                    };
                    if(next_focus_id!=null) {
                        plman.SetPlaylistFocusItem(act_pls, next_focus_id);
                        plman.SetPlaylistSelectionSingle(act_pls, next_focus_id, true);
                    };
                    plman.RemoveItemsFromPlaybackQueue(affected_items);
                } else {
                    plman.RemovePlaylistSelection(act_pls, false);
                };
                plman.SetPlaylistSelectionSingle(act_pls, plman.GetPlaylistFocusItemIndex(act_pls), true);
            };
            break;
        };
    } else {
        switch(mask) {
            case KMask.shift:
                if(vkey==VK_UP) { // SHIFT + KEY UP
                    if(list.SHIFT_count==0) {
                        if(list.SHIFT_start_id==null) {
                            list.SHIFT_start_id = list.focus_id;
                        };
                        plman.ClearPlaylistSelection(act_pls);
                        plman.SetPlaylistSelectionSingle(act_pls, list.focus_id, true);
                        if(list.focus_id>0) {
                            list.SHIFT_count--;
                            list.focus_id--;
                            plman.SetPlaylistSelectionSingle(act_pls, list.focus_id, true);
                            plman.SetPlaylistFocusItem(act_pls, list.focus_id);
                        };
                    } else if(list.SHIFT_count<0) {
                        if(list.focus_id>0) {
                            list.SHIFT_count--;
                            list.focus_id--;
                            plman.SetPlaylistSelectionSingle(act_pls, list.focus_id, true);
                            plman.SetPlaylistFocusItem(act_pls, list.focus_id);
                        };
                    } else {
                        plman.SetPlaylistSelectionSingle(act_pls, list.focus_id, false);
                        list.SHIFT_count--;
                        list.focus_id--;
                        plman.SetPlaylistFocusItem(act_pls, list.focus_id);
                    };
                };
                if(vkey==VK_DOWN) { // SHIFT + KEY DOWN
                    if(list.SHIFT_count==0) {
                        if(list.SHIFT_start_id==null) {
                            list.SHIFT_start_id = list.focus_id;
                        };
                        plman.ClearPlaylistSelection(act_pls);
                        plman.SetPlaylistSelectionSingle(act_pls, list.focus_id, true);
                        if(list.focus_id<list.total-1) {
                            list.SHIFT_count++;
                            list.focus_id++;
                            plman.SetPlaylistSelectionSingle(act_pls, list.focus_id, true);
                            plman.SetPlaylistFocusItem(act_pls, list.focus_id);
                        };
                    } else if(list.SHIFT_count>0) {
                        if(list.focus_id<list.total-1) {
                            list.SHIFT_count++;
                            list.focus_id++;
                            plman.SetPlaylistSelectionSingle(act_pls, list.focus_id, true);
                            plman.SetPlaylistFocusItem(act_pls, list.focus_id);
                        };
                    } else {
                        plman.SetPlaylistSelectionSingle(act_pls, list.focus_id, false);
                        list.SHIFT_count++;
                        list.focus_id++;
                        plman.SetPlaylistFocusItem(act_pls, list.focus_id);
                    };
                };
                break;
            case KMask.ctrl:
                if(vkey==65) { // CTRL+A
                    fb.RunMainMenuCommand("Edit/Select all");
                    window.Repaint();
                };
                if(vkey==67) { // CTRL+C
                    clipboard.selection = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
                };
                if(vkey==86) { // CTRL+V
                    // insert the clipboard selection (handles) after the current position in the active playlist
                    if(clipboard.selection) {
                        if(clipboard.selection.Count>0) {
                            try {
                                if(list.total>0) {
                                    plman.InsertPlaylistItems(plman.ActivePlaylist, list.focus_id+1, clipboard.selection);
                                } else {
                                    plman.InsertPlaylistItems(plman.ActivePlaylist, 0, clipboard.selection);
                                };
                            } catch(e) {
                                fb.trace("WSH Playlist 警告：無法貼上無效的剪貼簿內容");
                            };
                        };
                    };
                };
                if(vkey==70) { // CTRL+F
                    fb.RunMainMenuCommand("Edit/Search");
                };
                if(vkey==78) { // CTRL+N
                    fb.RunMainMenuCommand("File/New playlist");
                };
                if(vkey==79) { // CTRL+O
                    fb.RunMainMenuCommand("File/Open...");
                };
                if(vkey==80) { // CTRL+P
                    fb.RunMainMenuCommand("File/Preferences");
                };
                if(vkey==83) { // CTRL+S
                    fb.RunMainMenuCommand("File/Save playlist...");
                };
                break;
            case KMask.alt:
                if(vkey==65) { // ALT+A
                    fb.RunMainMenuCommand("View/Always on Top");
                };
                break;
        };
    };
};

function on_char(code) {
    if(list.total>0) {
        var tt_x = ((ww-vscrollbar.w) / 2) - (((g_search_string.length*13)+(10*2)) / 2);
        var tt_y = (wh/2) - 30;
        var tt_w = ((g_search_string.length*13)+(10*2));
        var tt_h = 60;
        if(code==32 && g_search_string.length==0) return true; // SPACE Char not allowed on 1st char
        if(g_search_string.length<=20 && tt_w<=ww-vscrollbar.w-20) {
            if (code > 31) {
                g_search_string = g_search_string + String.fromCharCode(code).toUpperCase();
                window.RepaintRect(0, tt_y-2, ww, tt_h+4);
                clear_incsearch_timer && window.ClearInterval(clear_incsearch_timer);
                clear_incsearch_timer = false;
                incsearch_timer && window.ClearTimeout(incsearch_timer);
                incsearch_timer = window.SetTimeout(function () {
                    IncrementalSearch();
                    window.ClearTimeout(incsearch_timer);
                    incsearch_timer = false;
                }, 400);
            };
        };
    };
};

//=================================================// Playback Callbacks
function on_playback_new_track(info) {
    g_seconds = 0;
    g_metadb = fb.GetNowPlaying();
    window.Repaint();
};

function on_playback_stop(reason) {
    if(reason==0) { // on user Stop
        g_metadb = fb.GetFocusItem();
        on_metadb_changed();
    };
    g_seconds = 0;
};

function on_playback_pause(state){
};

function on_playback_seek(time) {
    on_playback_time(time);
};

function on_playback_time(time) {
    // refresh now playing track in the playlist (play icon + time elapsed/remaining)
    g_seconds = time;
    if(g_playing_item_y!=null && plman.PlayingPlaylist==plman.ActivePlaylist) {
        if(g_playing_item_y>=0-row.h && g_playing_item_y<=wh+row.h) {
            if(g_playing_item_y<0) {
                g_playing_item_y = 0;
            };
            if(g_playing_item_y>wh-row.h) {
                g_playing_item_y = wh-row.h;
            };
            window.RepaintRect(0, g_playing_item_y, ww-vscrollbar.w, row.h);
        };
    };
    
    // -------------------------------------------------------------------------------/
    // Statistics TAGs Engine (v1.0 by Br3tt)
    // Update the TAGs below after 50% time played :
    // <FIRST_PLAYED>, <LAST_PLAYED>, <PLAY_COUNTER> (<PLAY_COUNT> replaced if found)
    // -------------------------------------------------------------------------------/
    if(time <= 1) {
        stats.updated = false;
        stats.metadb = fb.GetNowPlaying();
        stats.path_prefix = stats.metadb ? stats.metadb.rawpath.substring(0,4) : "";
        stats.taggable_file = (stats.path_prefix == "file" || stats.path_prefix== "cdda");
    };
    if(stats.metadb && stats.taggable_file && fb.IsMetadbInMediaLibrary(stats.metadb)) {
        if(time <= 1) {
            var total_seconds = stats.tf_length_seconds.Eval();
            stats.time_elapsed = Math.floor(time);
            if(total_seconds >= 10) {
                stats.limit = total_seconds - 5;
                stats.delay = Math.floor(total_seconds / 2);
            } else {
                stats.limit = total_seconds - 1;
                stats.delay = 2;
            };
            if(stats.delay < 0) stats.delay = 0;
            
        } else if(stats.time_elapsed > 0) {
            stats.time_elapsed++;
        };
               
        if(stats.time_elapsed >= stats.delay && time <= stats.limit) {
            stats.time_elapsed = 0;

            var new_play_counter;
            var old_play_count, old_play_counter;
            
            old_play_count = stats.tf_play_count.Eval();
            old_play_counter = stats.tf_play_counter.Eval();

            var timestamp = getTimestamp();

            if(old_play_count >= 0 && old_play_counter == "?") {
                new_play_counter = Math.floor(old_play_count) + 1;
            } else if(old_play_counter=="?") {
                new_play_counter = 1;
            } else {
                new_play_counter = Math.floor(old_play_counter) + 1;
            };
            
            var firstplayed_ts = stats.tf_first_played.Eval();

            // UPDATE TAGs
            if(stats.enabled && !stats.foo_playcount && !stats.updated) {
                if(firstplayed_ts != "?") {
                    var bool = stats.metadb.UpdateFileInfoSimple("LAST_PLAYED", timestamp, "PLAY_COUNTER", new_play_counter, "PLAY_COUNT", "");
                } else {
                    var bool = stats.metadb.UpdateFileInfoSimple("FIRST_PLAYED", timestamp, "LAST_PLAYED", timestamp, "PLAY_COUNTER", new_play_counter, "PLAY_COUNT", "");
                };
                stats.updated = true;
                // report to console
                fb.trace("WSH: 檔案已更新統計資料：" + fb.PlaybackTime);
            };
        };
    };
};

//=================================================// Font & Colors
function get_font() {
	if (g_instancetype == 0) {
		g_font = window.GetFontCUI(FontTypeCUI.items, "{82196D79-69BC-4041-8E2A-E3B4406BB6FC}");
		g_font_headers = window.GetFontCUI(FontTypeCUI.labels, "{C0D3B76C-324D-46D3-BB3C-E81C7D3BCB85}");
	} else if (g_instancetype == 1) {
		g_font = window.GetFontDUI(FontTypeDUI.playlists);
		g_font_headers = window.GetFontDUI(FontTypeDUI.tabs);
	};
    if(g_font_guifx_found) {
        rating_font = gdi.Font("guifx v2 transports", 17, 0);
        del_rating_font = gdi.Font("guifx v2 transports", 13, 0);
        mood_font = gdi.Font("guifx v2 transports", 16, 0);
    } else {
        rating_font = gdi.Font("Segoe UI Symbol", 16, 0);
        del_rating_font = gdi.Font("Segoe UI Symbol", 16, 0);
        mood_font = gdi.Font("Segoe UI Symbol", 16, 1);
    };
};

function get_colors() {
	if (g_instancetype == 0) {
		g_textcolor = window.GetColorCUI(ColorTypeCUI.text);
		g_textcolor_sel = window.GetColorCUI(ColorTypeCUI.selection_background);
		g_textcolor_hl = window.GetColorCUI(ColorTypeCUI.inactive_selection_text);
		g_backcolor = window.GetColorCUI(ColorTypeCUI.background);
		g_backcolor_sel = window.GetColorCUI(ColorTypeCUI.selection_background)
	} else if (g_instancetype == 1) {
		g_textcolor = window.GetColorDUI(ColorTypeDUI.text);
		g_textcolor_sel = window.GetColorDUI(ColorTypeDUI.selection);
		g_textcolor_hl = window.GetColorDUI(ColorTypeDUI.highlight);
		g_backcolor = window.GetColorDUI(ColorTypeDUI.background);
		g_backcolor_sel = g_textcolor_sel
	};
    g_syscolor = utils.GetSysColor(COLOR_BTNFACE);

    // Custom colors set in Properties of the panel
    if(panel.custom_colors) {
        try{
            if(panel.custom_textcolor.length>0) g_textcolor = eval(panel.custom_textcolor);
            if(panel.custom_textcolor_selection.length>0) {
                g_textcolor_sel = eval(panel.custom_textcolor_selection);
                g_backcolor_sel = g_textcolor_sel;
            };
            if(panel.custom_backcolor.length>0) g_backcolor = eval(panel.custom_backcolor);
            if(panel.custom_textcolor_highlight.length>0) g_textcolor_hl = eval(panel.custom_textcolor_highlight);
        } catch(e) {};
    };

	g_backcolor_R = getRed(g_backcolor);
	g_backcolor_G = getGreen(g_backcolor);
	g_backcolor_B = getBlue(g_backcolor)
};

//=================================================// Images (general)
function set_scroller() {
    var gb;
    
    try {
        cursor.img_normal = gdi.CreateImage(cursor.w, cursor.h);
    } catch(e) {
        cursor.h = cursor.default_h;
        cursor.img_normal = gdi.CreateImage(cursor.w, cursor.h);
    };
    
    gb = cursor.img_normal.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        vscrollbar.theme.SetPartAndStateId(3, 1);
        vscrollbar.theme.DrawThemeBackground(gb, 0, 0, cursor.w, cursor.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        gb.FillRoundRect(3, 0, cursor.w-6, cursor.h-1, 1, 1, g_textcolor&0x44ffffff);
        gb.DrawRoundRect(3, 0, cursor.w-6, cursor.h-1, 1, 1, 1.0, g_textcolor&0x44ffffff);
        gb.SetSmoothingMode(0);
    };
    cursor.img_normal.ReleaseGraphics(gb);

    cursor.img_hover = gdi.CreateImage(cursor.w, cursor.h);
    gb = cursor.img_hover.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        vscrollbar.theme.SetPartAndStateId(3, 2);
        vscrollbar.theme.DrawThemeBackground(gb, 0, 0, cursor.w, cursor.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        gb.FillRoundRect(3, 0, cursor.w-6, cursor.h-1, 1, 1, g_textcolor&0x88ffffff);
        gb.DrawRoundRect(3, 0, cursor.w-6, cursor.h-1, 1, 1, 1.0, g_textcolor&0x88ffffff);
        gb.SetSmoothingMode(0);
    };
    cursor.img_hover.ReleaseGraphics(gb);
    cursor.bt = new button(cursor.img_normal, cursor.img_hover, cursor.img_hover);
};

function init_vscrollbar_buttons() {
    var i, gb;

    cursor.popup = gdi.CreateImage(27, 22);
    gb = cursor.popup.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillRoundRect(0,0,22-1,22-1,3,3,g_textcolor);
    gb.DrawRoundRect(0,0,22-1,22-1,3,3,1.0,RGBA(0,0,0,150));
    var points = Array(22-2,7, 22-2+6,11, 22-2,22-7);
    gb.FillPolygon(g_textcolor, 0, points);
    gb.DrawPolygon(RGBA(0,0,0,150), 1.0, points);
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(22-4,6,3,22-10,g_textcolor);
    cursor.popup.ReleaseGraphics(gb);
    
    button_up.img_normal = gdi.CreateImage(button_up.w, button_up.h);
    gb = button_up.img_normal.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        vscrollbar.theme.SetPartAndStateId(1, 1);
        vscrollbar.theme.DrawThemeBackground(gb, 0, 0, button_up.w, button_up.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, 10, mid_x+0, 5, 2.0, g_textcolor&0x44ffffff);
        gb.DrawLine(mid_x+0, 6, mid_x+3, 10, 2.0, g_textcolor&0x44ffffff);
    };
    button_up.img_normal.ReleaseGraphics(gb);

    button_up.img_hover = gdi.CreateImage(button_up.w, button_up.h);
    gb = button_up.img_hover.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        vscrollbar.theme.SetPartAndStateId(1, 2);
        vscrollbar.theme.DrawThemeBackground(gb, 0, 0, button_up.w, button_up.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, 10, mid_x+0, 5, 2.0, g_textcolor&0x88ffffff);
        gb.DrawLine(mid_x+0, 6, mid_x+3, 10, 2.0, g_textcolor&0x88ffffff);
    };
    button_up.img_hover.ReleaseGraphics(gb);

    button_up.img_down = gdi.CreateImage(button_up.w, button_up.h);
    gb = button_up.img_down.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        vscrollbar.theme.SetPartAndStateId(1, 3);
        vscrollbar.theme.DrawThemeBackground(gb, 0, 0, button_up.w, button_up.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, 10, mid_x+0, 5, 2.0, g_textcolor);
        gb.DrawLine(mid_x+0, 6, mid_x+3, 10, 2.0, g_textcolor);
    };
    button_up.img_down.ReleaseGraphics(gb);

    button_down.img_normal = gdi.CreateImage(button_down.w, button_down.h);
    gb = button_down.img_normal.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        vscrollbar.theme.SetPartAndStateId(1, 5);
        vscrollbar.theme.DrawThemeBackground(gb, 0, 0, button_down.w, button_down.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, button_down.h-11, mid_x+0, button_down.h-6, 2.0, g_textcolor&0x44ffffff);
        gb.DrawLine(mid_x+0, button_down.h-7, mid_x+3, button_down.h-11, 2.0, g_textcolor&0x44ffffff);
    };
    button_down.img_normal.ReleaseGraphics(gb);

    button_down.img_hover = gdi.CreateImage(button_down.w, button_down.h);
    gb = button_down.img_hover.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        vscrollbar.theme.SetPartAndStateId(1, 6);
        vscrollbar.theme.DrawThemeBackground(gb, 0, 0, button_down.w, button_down.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, button_down.h-11, mid_x+0, button_down.h-6, 2.0, g_textcolor&0x88ffffff);
        gb.DrawLine(mid_x+0, button_down.h-7, mid_x+3, button_down.h-11, 2.0, g_textcolor&0x88ffffff);
    };
    button_down.img_hover.ReleaseGraphics(gb);

    button_down.img_down = gdi.CreateImage(button_down.w, button_down.h);
    gb = button_down.img_down.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    try {
        vscrollbar.theme.SetPartAndStateId(1, 7);
        vscrollbar.theme.DrawThemeBackground(gb, 0, 0, button_down.w, button_down.h);
    } catch(e) {
        gb.SetSmoothingMode(2);
        var mid_x = Math.round(button_up.w/2);
        gb.DrawLine(mid_x-4, button_down.h-11, mid_x+0, button_down.h-6, 2.0, g_textcolor);
        gb.DrawLine(mid_x+0, button_down.h-7, mid_x+3, button_down.h-11, 2.0, g_textcolor);
    };
    button_down.img_down.ReleaseGraphics(gb);

    vscrollbar.arr_buttons.splice(0, vscrollbar.arr_buttons.length);
    for(i=0;i<vscrollbar.button_total;i++) {
        switch(i) {
         case 0:
            vscrollbar.arr_buttons.push(new button(button_up.img_normal, button_up.img_hover, button_up.img_down));
            break;
         case 1:
            vscrollbar.arr_buttons.push(new button(button_down.img_normal, button_down.img_hover, button_down.img_down));
            break;            
        };
    };
};

//=================================================// Init Icons and Images (no_cover ...)
function init_icons() {
    var i;
    var gb;
    var gui_font = gdi.Font("guifx v2 transports", 15, 0);
    
    glass_reflect_img = draw_glass_reflect(120, 120);
       
    playicon_off = gdi.CreateImage(20, row.h);
    gb = playicon_off.GetGraphics();
    gb.SetSmoothingMode(2);
    var x1 = 0;
    var y1 = Math.floor(row.h/2) - 6;
    var x2 = 12;
    var y2 = Math.floor(row.h/2);
    var x3 = 0;
    var y3 = Math.floor(row.h/2) + 6;
    var points = Array(x1, y1, x2, y2, x3, y3);
    gb.FillPolygon(g_textcolor, 0, points);
    //gb.DrawPolygon(g_textcolor, 1.0, points);
    gb.SetSmoothingMode(0);
    playicon_off.ReleaseGraphics(gb);

    playicon_on = gdi.CreateImage(20, row.h);
    gb = playicon_on.GetGraphics();
    gb.SetSmoothingMode(2);
    var x1 = 0;
    var y1 = Math.floor(row.h/2) - 6;
    var x2 = 12;
    var y2 = Math.floor(row.h/2);
    var x3 = 0;
    var y3 = Math.floor(row.h/2) + 6;
    var points = Array(x1, y1, x2, y2, x3, y3);
    //gb.FillPolygon(RGB(255,255,255), 0, points);
    gb.FillPolygon(g_textcolor_sel, 0, points);
    //gb.DrawPolygon(g_textcolor, 1.0, points);
    gb.SetSmoothingMode(0);
    playicon_on.ReleaseGraphics(gb);
    
    // singleline group header icon 
    singleline_group_header_icon = gdi.CreateImage(18, 16);
    gb = singleline_group_header_icon.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.DrawEllipse(1,2,12,12,1.0,g_textcolor_hl&0x99ffffff);
    gb.FillEllipse(3,4,8,8,g_textcolor&0x55ffffff);
    singleline_group_header_icon.ReleaseGraphics(gb);
  
    // drag_n_drop markers around line of insert
    icon_arrow_left = gdi.CreateImage(8, 8);
    gb = icon_arrow_left.GetGraphics();
    gb.SetSmoothingMode(0);
    gb.DrawLine(0, 0, 0, 7, 1.0, g_textcolor);
    gb.DrawLine(1, 1, 1, 7-1, 1.0, g_textcolor);
    gb.DrawLine(2, 2, 2, 7-2, 1.0, g_textcolor);
    gb.DrawLine(3, 3, 3, 7-3, 1.0, g_textcolor);
    icon_arrow_left.ReleaseGraphics(gb);

    nocover = gdi.CreateImage(200, 200);
    gb = nocover.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillSolidRect(0,0,200,200,g_textcolor);
    gb.FillGradRect(0,0,200,200,90,g_backcolor&0xbbffffff,g_backcolor,1.0);
    gb.SetTextRenderingHint(3);
    gui_font = gdi.Font("Segoe UI", 108, 1);
    gb.DrawString("NO", gui_font, g_textcolor&0x25ffffff, 0, 0, 200, 110, cc_stringformat);
    gui_font = gdi.Font("Segoe UI", 48, 1);
    gb.DrawString("COVER", gui_font, g_textcolor&0x20ffffff, 1, 70, 200, 110, cc_stringformat);
    gb.FillSolidRect(24, 155, 152, 20, g_textcolor&0x15ffffff);
    nocover.ReleaseGraphics(gb);
    
    noartist = gdi.CreateImage(200, 200);
    gb = noartist.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillSolidRect(0,0,200,200,g_textcolor);
    gb.FillGradRect(0,0,200,200,90,g_backcolor&0xbbffffff,g_backcolor,1.0);
    gb.FillEllipse(100-90/2,110,150,300,g_textcolor&0x25ffffff);
    gb.FillEllipse(100-90/2,25,90,90,g_textcolor&0x25ffffff);
    noartist.ReleaseGraphics(gb);

    streamcover = gdi.CreateImage(200, 200);
    gb = streamcover.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillSolidRect(0,0,200,200,g_textcolor);
    gb.FillGradRect(0,0,200,200,90,g_backcolor&0xbbffffff,g_backcolor,1.0);
    gui_font = gdi.Font("Segoe UI", 42, 0);
    gb.SetTextRenderingHint(3);
    gb.DrawString("stream", gui_font, g_backcolor, 1, 2, 200, 190, cc_stringformat);
    gb.DrawString("stream", gui_font, g_textcolor&0x99ffffff, 1, 0, 200, 190, cc_stringformat);
    streamcover.ReleaseGraphics(gb);

    // Toolbar buttons
    
    // Settings Menu button
    bt_settings_off = gdi.CreateImage(30, 20);
    gb = bt_settings_off.GetGraphics();
    gui_font = gdi.Font("Tahoma", 28, 1);
    gb.SetTextRenderingHint(3);
    gb.DrawString("*", gui_font, RGB(150,150,150), 0, 2, 20, 20, lc_stringformat);
    gb.SetSmoothingMode(2);
    gb.FillEllipse(2,3,12,10,RGB(140,140,140));
    gb.DrawEllipse(5,5,6,6,2.0,RGBA(0,0,0,200));
    gb.DrawEllipse(2,3,12,10,1.0,RGBA(0,0,0,80));
    gb.SetSmoothingMode(0);
    gb.DrawLine(16+8-4, 8-2+2, 16+8+4, 8-2+2, 1.0, RGB(140,140,140));
    gb.DrawLine(16+8-3, 8-1+2, 16+8+3, 8-1+2, 1.0, RGB(140,140,140));
    gb.DrawLine(16+8-2, 8-0+2, 16+8+2, 8-0+2, 1.0, RGB(140,140,140));
    gb.DrawLine(16+8-1, 8+1+2, 16+8+1, 8+1+2, 1.0, RGB(140,140,140));
    gb.FillSolidRect(16+8-0, 8+2+2, 1, 1, RGB(140,140,140));
    bt_settings_off.ReleaseGraphics(gb);

    bt_settings_ov = gdi.CreateImage(30, 20);
    gb = bt_settings_ov.GetGraphics();
    gui_font = gdi.Font("Tahoma", 28, 1);
    gb.SetTextRenderingHint(3);
    gb.DrawString("*", gui_font, RGB(190,190,190), 0, 2, 20, 20, lc_stringformat);
    gb.SetSmoothingMode(2);
    gb.FillEllipse(2,3,12,10,RGB(180,180,180));
    gb.DrawEllipse(5,5,6,6,2.0,RGBA(0,0,0,220));
    gb.DrawEllipse(2,3,12,10,1.0,RGBA(0,0,0,140));
    gb.SetSmoothingMode(0);
    gb.DrawLine(16+8-4, 8-2+2, 16+8+4, 8-2+2, 1.0, RGB(180,180,180));
    gb.DrawLine(16+8-3, 8-1+2, 16+8+3, 8-1+2, 1.0, RGB(180,180,180));
    gb.DrawLine(16+8-2, 8-0+2, 16+8+2, 8-0+2, 1.0, RGB(180,180,180));
    gb.DrawLine(16+8-1, 8+1+2, 16+8+1, 8+1+2, 1.0, RGB(180,180,180));
    gb.FillSolidRect(16+8-0, 8+2+2, 1, 1, RGB(180,180,180));
    bt_settings_ov.ReleaseGraphics(gb);
    
    bt_settings_on = gdi.CreateImage(30, 20);
    gb = bt_settings_on.GetGraphics();
    gui_font = gdi.Font("Tahoma", 28, 1);
    gb.SetTextRenderingHint(3);
    gb.DrawString("*", gui_font, RGB(230,230,230), 0, 2, 20, 20, lc_stringformat);
    gb.SetSmoothingMode(2);
    gb.FillEllipse(2,3,12,10,RGB(180,180,180));
    gb.DrawEllipse(5,5,6,6,2.0,RGBA(0,0,0,240));
    gb.DrawEllipse(2,3,12,10,1.0,RGBA(0,0,0,160));
    gb.SetSmoothingMode(0);
    gb.DrawLine(16+8-4, 8-2+2, 16+8+4, 8-2+2, 1.0, RGB(220,220,220));
    gb.DrawLine(16+8-3, 8-1+2, 16+8+3, 8-1+2, 1.0, RGB(220,220,220));
    gb.DrawLine(16+8-2, 8-0+2, 16+8+2, 8-0+2, 1.0, RGB(220,220,220));
    gb.DrawLine(16+8-1, 8+1+2, 16+8+1, 8+1+2, 1.0, RGB(220,220,220));
    gb.FillSolidRect(16+8-0, 8+2+2, 1, 1, RGB(220,220,220));
    bt_settings_on.ReleaseGraphics(gb);

    // Sort/group Menu button
    bt_sort_off = gdi.CreateImage(30, 20);
    gb = bt_sort_off.GetGraphics();
    gui_font = gdi.Font("Tahoma", 15, 0);
    gb.SetTextRenderingHint(5);
    gb.DrawString("Az", gui_font, RGB(140,140,140), 0, -2, 20, 20, lc_stringformat);
    gb.SetSmoothingMode(0);
    gb.DrawLine(16+8-4, 8-2+2, 16+8+4, 8-2+2, 1.0, RGB(140,140,140));
    gb.DrawLine(16+8-3, 8-1+2, 16+8+3, 8-1+2, 1.0, RGB(140,140,140));
    gb.DrawLine(16+8-2, 8-0+2, 16+8+2, 8-0+2, 1.0, RGB(140,140,140));
    gb.DrawLine(16+8-1, 8+1+2, 16+8+1, 8+1+2, 1.0, RGB(140,140,140));
    gb.FillSolidRect(16+8-0, 8+2+2, 1, 1, RGB(140,140,140));
    bt_sort_off.ReleaseGraphics(gb);

    bt_sort_ov = gdi.CreateImage(30, 20);
    gb = bt_sort_ov.GetGraphics();
    gui_font = gdi.Font("Tahoma", 15, 0);
    gb.SetTextRenderingHint(5);
    gb.DrawString("Az", gui_font, RGB(180,180,180), 0, -2, 20, 20, lc_stringformat);
    gb.SetSmoothingMode(0);
    gb.DrawLine(16+8-4, 8-2+2, 16+8+4, 8-2+2, 1.0, RGB(180,180,180));
    gb.DrawLine(16+8-3, 8-1+2, 16+8+3, 8-1+2, 1.0, RGB(180,180,180));
    gb.DrawLine(16+8-2, 8-0+2, 16+8+2, 8-0+2, 1.0, RGB(180,180,180));
    gb.DrawLine(16+8-1, 8+1+2, 16+8+1, 8+1+2, 1.0, RGB(180,180,180));
    gb.FillSolidRect(16+8-0, 8+2+2, 1, 1, RGB(180,180,180));
    bt_sort_ov.ReleaseGraphics(gb);
    
    bt_sort_on = gdi.CreateImage(30, 20);
    gb = bt_sort_on.GetGraphics();
    gui_font = gdi.Font("Tahoma", 15, 0);
    gb.SetTextRenderingHint(5);
    gb.DrawString("Az", gui_font, RGB(220,220,220), 0, -2, 20, 20, lc_stringformat);
    gb.SetSmoothingMode(0);
    gb.DrawLine(16+8-4, 8-2+2, 16+8+4, 8-2+2, 1.0, RGB(220,220,220));
    gb.DrawLine(16+8-3, 8-1+2, 16+8+3, 8-1+2, 1.0, RGB(220,220,220));
    gb.DrawLine(16+8-2, 8-0+2, 16+8+2, 8-0+2, 1.0, RGB(220,220,220));
    gb.DrawLine(16+8-1, 8+1+2, 16+8+1, 8+1+2, 1.0, RGB(220,220,220));
    gb.FillSolidRect(16+8-0, 8+2+2, 1, 1, RGB(220,220,220));
    bt_sort_on.ReleaseGraphics(gb);

    toolbar.buttons.splice(0, toolbar.buttons.length);
    for(i=0;i<2;i++) {
        switch(i) {
         case 0:
            toolbar.buttons.push(new button(bt_settings_off, bt_settings_ov, bt_settings_on));
            break;
         case 1:
            toolbar.buttons.push(new button(bt_sort_off, bt_sort_ov, bt_sort_on));
            break;            
        };
    };
};

function recalc_datas() {
    
    if(toolbar.lock) {
        toolbar.delta = toolbar.collapsed_y*-1;
        toolbar.state = true;
    };
       
    if(panel.nogroupheader) {
        group.nbrows = 0;
    } else {
        group.nbrows = group.nbrows_default;
    };
    
    list.nbvis = (((wh-toolbar.h)/row.h) == Math.ceil((wh-toolbar.h)/row.h)) ? Math.ceil((wh-toolbar.h)/row.h) : Math.ceil(((wh-toolbar.h)/row.h)-1);
    
    if(panel.themed) {
        vscrollbar.theme = window.CreateThemeManager("scrollbar");
        list.theme = window.CreateThemeManager("listview");
    } else {
        vscrollbar.theme = false;
        list.theme = false;
    };
    init_vscrollbar_buttons();
  
    button_up.y = 0;
    button_down.y = wh - button_down.h;
    vscrollbar.y = button_up.h;
    vscrollbar.h = wh - button_up.h - button_down.h;
    cursor.x = ww-vscrollbar.w;
    cursor.y = vscrollbar.y;
    
    if(cover.show) {
        cover.w = group.nbrows*row.h;
    } else {
        cover.w = 0;
    };
    if(cover.w>row.h) {
        cover.visible = true;
        cover.h = cover.w;
        cover.nbrows = Math.ceil(cover.w/row.h);
    } else {
        cover.visible = false;
        cover.h = cover.w;
        cover.nbrows = Math.ceil(cover.w/row.h);
    };
};

function redraw_stub_images() {
    nocover_img = FormatCover(nocover, (cover.w-cover.margin*2), (cover.h-cover.margin*2));
    noartist_img = FormatCover(noartist, (cover.w-cover.margin*2), (cover.h-cover.margin*2));
    streamcover_img = FormatCover(streamcover, (cover.w-cover.margin*2), (cover.h-cover.margin*2));
};

function SelectGroupItems(start_id) {
    var count = 0;
    var affectedItems = Array();
    
    if(!utils.IsKeyPressed(VK_CONTROL)) {
        plman.ClearPlaylistSelection(plman.ActivePlaylist);
    };

    for(var i = start_id; i < list.total; i++) {
        if(list.hlist[i] != list.hlist[start_id]) {
            break;
        } else {
            affectedItems.push(i);
        };
        count++;
        if(count>9999) break;
    };
    plman.SetPlaylistSelection(plman.ActivePlaylist, affectedItems, true);
    plman.SetPlaylistFocusItem(plman.ActivePlaylist, start_id);
    CollectGarbage();
};

function SelectAtoB(start_id, end_id) {

    var affectedItems = Array();
    
    if(list.SHIFT_start_id==null) {
        list.SHIFT_start_id = start_id;
    };
    
    plman.ClearPlaylistSelection(plman.ActivePlaylist);
    
    var previous_focus_id = list.focus_id;
    
    if(start_id<end_id) {
        var deb = start_id;
        var fin = end_id;
    } else {
        var deb = end_id;
        var fin = start_id;        
    };

    for(var i=deb;i<=fin;i++) {
        affectedItems.push(i);
    };
    plman.SetPlaylistSelection(plman.ActivePlaylist, affectedItems, true);
    
    plman.SetPlaylistFocusItem(plman.ActivePlaylist, end_id);
    
    if(affectedItems.length>1) {
        if(end_id > previous_focus_id) {
            var delta = end_id - previous_focus_id;
            list.SHIFT_count += delta;
        } else {
            var delta = previous_focus_id - end_id;
            list.SHIFT_count -= delta;
        };
    };
    
    window.Repaint();
};

function ShowNowPlaying() {
    if(fb.IsPlaying) {
        if(plman.PlayingPlaylist!=plman.ActivePlaylist) {
            plman.ActivePlaylist = plman.PlayingPlaylist;
        };
        if(plman.PlaylistItemCount(plman.PlayingPlaylist)==0 || !fb.GetFocusItem(false)) return true;
        plman.ClearPlaylistSelection(plman.ActivePlaylist);
        list.nowplaying = plman.GetPlayingItemLocation();
        var pid = list.nowplaying.PlaylistItemIndex;
        plman.SetPlaylistFocusItem(plman.ActivePlaylist, pid);
        plman.SetPlaylistSelectionSingle(plman.ActivePlaylist, pid, true);
        if(pid>=0 && pid<list.total) {
            refresh_spv(plman.ActivePlaylist, false);
        };
    } else {
        plman.ClearPlaylistSelection(plman.ActivePlaylist);
        var pid = plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist);
        plman.SetPlaylistFocusItem(plman.ActivePlaylist, pid);
        plman.SetPlaylistSelectionSingle(plman.ActivePlaylist, pid, true);
        if(pid>=0 && pid<list.total) {
            refresh_spv(plman.ActivePlaylist, false);
        };
    };
};

function ShowSelectedItem(pid) {
    if(list.total==0 || !fb.GetFocusItem(false)) return true;
    if(pid<0) {
        pid = plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist);
    };
    plman.ClearPlaylistSelection(plman.ActivePlaylist);
    plman.SetPlaylistFocusItem(plman.ActivePlaylist, pid);
    plman.SetPlaylistSelectionSingle(plman.ActivePlaylist, pid, true);
    refresh_spv(plman.ActivePlaylist);
};

function IncrementalSearch() {
    var count=0;
    var sartist, stitle;
    //var chr;
    //var gstart = 0;
    var pid = -1;
    
    // exit if no search string in cache
    if(g_search_string.length<=0) return true;
    
    // 1st char of the search string
    //var first_chr = g_search_string.substring(0,1);  
    //var len = g_search_string.length;
    
    // which start point for the search
    /*if(list.total>1000) {
        var info = list.handlelist.Item(Math.floor(list.total/2)).GetFileInfo();
        stitle = info.MetaValue(info.MetaFind("TITLE"), 0) ? tf_titleO.EvalWithMetadb(list.handlelist.Item(Math.floor(list.total/2))) : tf_title.EvalWithMetadb(list.handlelist.Item(Math.floor(list.total/2)));
        //sartist = tf_albumartist.EvalWithMetadb(list.handlelist.Item(Math.floor(list.total/2)));
        //chr = albumartist.substring(0,1);
        if(g_search_string.charCodeAt(0) > stitle.toUpperCase().charCodeAt(0)) {
            gstart = Math.floor(list.total/2);
        };
    };*/

    var format_str = "";
    for(var i=0;i<list.total;i++) {
        var info = list.handlelist.Item(i).GetFileInfo();
        stitle = info.MetaValue(info.MetaFind("TITLE"), 0) ? tf_titleO.EvalWithMetadb(list.handlelist.Item(i)) : tf_title.EvalWithMetadb(list.handlelist.Item(i));
        sartist = tf_albumartist.EvalWithMetadb(list.handlelist.Item(i));
        //format_str = albumartist.substring(0,len).toUpperCase();
        if (stitle.toUpperCase().match(g_search_string)) {
            pid = i;
            break;
        } else if (sartist.toUpperCase().match(g_search_string)) {
            pid = i;
            break;
	}
    };
    
    if(pid>=0) { // found!
        ShowSelectedItem(pid);
    } else {
        list.inc_search_noresult = true;
        window.Repaint();
    };
    
    clear_incsearch_timer && window.ClearInterval(clear_incsearch_timer);
    clear_incsearch_timer = window.SetInterval(function () {
        // reset incremental search string after 1 seconds without any key pressed
        var tt_x = ((ww-vscrollbar.w) / 2) - (((g_search_string.length*13)+(10*2)) / 2);
        var tt_y = (wh/2) - 30;
        var tt_w = ((g_search_string.length*13)+(10*2));
        var tt_h = 60;
        g_search_string = "";
        window.RepaintRect(0, tt_y-2, ww-vscrollbar.w, tt_h+4);
        clear_incsearch_timer && window.ClearInterval(clear_incsearch_timer);
        clear_incsearch_timer = false;
        list.inc_search_noresult = false;
    }, 1000);
};


//=================================================// Item Context Menu
function new_context_menu(x, y, id, array_id) {
	var _menu = window.CreatePopupMenu();
	var Context = fb.CreateContextMenuManager();

	var _child1 = window.CreatePopupMenu();
	var _child2 = window.CreatePopupMenu();
	var WShell = new ActiveXObject("WScript.Shell");

	list.metadblist_selection = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
	Context.InitContext(list.metadblist_selection);
	Context.BuildMenu(_menu, 1, -1);
	var info = list.metadblist_selection.item(i).GetFileInfo();
	var o_title = info.MetaValue(info.MetaFind("TITLE"), 0) ? tf_titleO : fb.TitleFormat("");
	var o_artist = fb.TitleFormat("$ifequal($stricmp(%artist%,?),1,,%artist%)");
	var o_album = fb.TitleFormat("$ifequal($stricmp(%album%,?),1,,%album%)");

	_menu.AppendMenuSeparator();
	_menu.AppendMenuItem((fb.IsAutoPlaylist(plman.ActivePlaylist) || isQueuePlaylistActive())?MF_DISABLED|MF_GRAYED:MF_STRING, 1000, "移除選取的項目");
	_child1.AppendTo(_menu, MF_STRING, "傳送到…");
	_child1.AppendMenuItem(MF_STRING, 2000, "新播放清單");
	_menu.AppendMenuSeparator();
	_menu.AppendMenuItem(list.metadblist_selection.count==1 && info.MetaValue(info.MetaFind("TITLE"), 0) && !tf_artist.EvalWithMetadb(list.metadblist_selection.item(i)).match(/\*/) ? MF_GRAYED|MF_DISABLED : MF_STRING, 3000, list.metadblist_selection.count==1 && ( !info.MetaValue(info.MetaFind("TITLE"), 0) || tf_artist.EvalWithMetadb(list.metadblist_selection.item(i)).match(/\*/) ) ? "自動標籤 *：" + (o_title.EvalWithMetadb(list.metadblist_selection.item(i)) ? "" : tf_title.EvalWithMetadb(list.metadblist_selection.item(i)).replace("*", "") + (o_artist.EvalWithMetadb(list.metadblist_selection.item(i)) ? "" : ", ")) + (o_artist.EvalWithMetadb(list.metadblist_selection.item(i)) ? "" : tf_artist.EvalWithMetadb(list.metadblist_selection.item(i)).replace("*", "")) : "自動標籤 *");
	_menu.AppendMenuItem(list.metadblist_selection.count==1 && !o_title.EvalWithMetadb(list.metadblist_selection.item(i)) && !o_artist.EvalWithMetadb(list.metadblist_selection.item(i)) && !o_album.EvalWithMetadb(list.metadblist_selection.item(i)) ? MF_GRAYED|MF_DISABLED : MF_STRING, 4000, "標籤簡轉繁");
	_child2.AppendTo(_menu, MF_STRING, "網路搜尋");
	_child2.AppendMenuItem(MF_STRING, 5100, "KKBOX 歌曲");
	_child2.AppendMenuItem(MF_STRING, 5200, "KKBOX 歌手");
	_child2.AppendMenuItem(MF_STRING, 5300, "Google 歌曲");
	_child2.AppendMenuItem(MF_STRING, 5400, "Google 歌手");
	_menu.AppendMenuItem(MF_STRING, 6000, "開啟檔案…");
	var pl_count = plman.PlaylistCount;
	if(pl_count>1) {
		_child1.AppendMenuSeparator();
	};
	for(var i=0;i<pl_count;i++) {
		if(i!=plman.ActivePlaylist && !fb.IsAutoPlaylist(i)) {
			_child1.AppendMenuItem(MF_STRING, 2001+i, plman.GetPlaylistName(i));
		};
	};

	var ret = _menu.TrackPopupMenu(x, y);
	if(ret<800) {
		Context.ExecuteByID(ret - 1);
	} else if(ret<1000) {
		switch (ret) {
		case 880:
		break;
		};
	} else {
		switch (ret) {
		case 1000:
			plman.RemovePlaylistSelection(plman.ActivePlaylist, false);
		break;
		case 2000:
			fb.RunMainMenuCommand("File/New playlist");
			plman.InsertPlaylistItems(plman.PlaylistCount-1, 0, list.metadblist_selection, false);
		break;
		case 3000:
			for (i=0; i<list.metadblist_selection.count; i++) {
				info = list.metadblist_selection.item(i).GetFileInfo();
				if (!info.MetaValue(info.MetaFind("TITLE"), 0)) {
					var title = tf_title.EvalWithMetadb(list.metadblist_selection.item(i)).replace("*", "");
					list.metadblist_selection.item(i).UpdateFileInfoSimple("TITLE", title);
				}
				if (tf_artist.EvalWithMetadb(list.metadblist_selection.item(i)).match(/\*/)) {
					var artist = tf_artist.EvalWithMetadb(list.metadblist_selection.item(i)).replace("*", "");
					list.metadblist_selection.item(i).UpdateFileInfoSimple("ARTIST", artist);
				}
			}
		break;
		case 4000:
			for (i=0; i<list.metadblist_selection.count; i++) {
				var title = TransChinese(o_title.EvalWithMetadb(list.metadblist_selection.item(i)), 1);
				var artist = TransChinese(o_artist.EvalWithMetadb(list.metadblist_selection.item(i)), 1);
				var album = TransChinese(o_album.EvalWithMetadb(list.metadblist_selection.item(i)), 1);
				list.metadblist_selection.item(i).UpdateFileInfoSimple("TITLE", title, "ARTIST", artist, "ALBUM", album);
			}
		break;
		case 5100:
			WShell.run("http://tw.kkbox.com/search.php?word=" + fb.TitleFormat("$replace(%title%, ,+)").EvalWithMetadb(fb.GetFocusItem()) + "&search=song");
		break;
		case 5200:
			WShell.run("http://tw.kkbox.com/search.php?word=" + fb.TitleFormat("$replace(%artist%, ,+)").EvalWithMetadb(fb.GetFocusItem()) + "&search=artist");
		break;
		case 5300:
			WShell.run("http://www.google.com/search?q=" + fb.TitleFormat("$replace(%artist%+%title%, ,+)").EvalWithMetadb(fb.GetFocusItem()) + "&ie=utf-8");
		break;
		case 5400:
			WShell.run("http://www.google.com/search?q=" + fb.TitleFormat("$replace(%artist%, ,+)").EvalWithMetadb(fb.GetFocusItem()) + "&ie=utf-8");
		break;
		case 6000:
			WShell.run("rundll32.exe shell32.dll,OpenAs_RunDLL " + fb.TitleFormat("%_path%").EvalWithMetadb(fb.GetFocusItem()));
		break;
		default:
			var insert_index = plman.PlaylistItemCount(ret-2001);
			plman.InsertPlaylistItems((ret-2001), insert_index, list.metadblist_selection, false);
		};
	};
	_child1.Dispose();
	_child2.Dispose();
	_menu.Dispose();
	return true;
};

function sort_group_menu(x, y) {
    var idx;
    var _menu = window.CreatePopupMenu();
    var _sort = window.CreatePopupMenu();
    var _groupby = window.CreatePopupMenu();
   
	_sort.AppendTo(_menu, MF_STRING, "排序");
	_sort.AppendMenuItem(MF_STRING, 100, "歌手");
	_sort.AppendMenuItem(MF_STRING, 110, "標題");
	_sort.AppendMenuItem(MF_STRING, 120, "專輯");
	_sort.AppendMenuItem(MF_STRING, 130, "曲目");
	_sort.AppendMenuItem(MF_STRING, 140, "類型");
	_sort.AppendMenuItem(MF_STRING, 150, "評等");
	_sort.AppendMenuItem(MF_STRING, 160, "日期");
	_sort.AppendMenuItem(MF_STRING, 170, "速率");
	_sort.AppendMenuItem(MF_STRING, 180, "路徑");
	_sort.AppendMenuItem(MF_STRING, 190, "曲長");
	_sort.AppendMenuItem(MF_STRING, 191, "隨機");
	_sort.AppendMenuItem(MF_STRING, 192, "反向");
	_groupby.AppendTo(_menu, MF_STRING, "群組/排序");
	_groupby.AppendMenuItem(MF_STRING, 200, "專輯");
	_groupby.AppendMenuItem(MF_STRING, 201, "歌手");
	_groupby.AppendMenuItem(MF_STRING, 202, "路徑");
    idx = _menu.TrackPopupMenu(x, y);
    switch(idx) {
        case 100:
            plman.SortByFormat(plman.ActivePlaylist, sort_pattern_artist, false);
            break;
        case 110:
            plman.SortByFormat(plman.ActivePlaylist, sort_pattern_title, false);
            break;
        case 120:
            plman.SortByFormat(plman.ActivePlaylist, sort_pattern_album, false);
            break;
        case 130:
            plman.SortByFormat(plman.ActivePlaylist, sort_pattern_tracknumber, false);
            break;
        case 140:
            plman.SortByFormat(plman.ActivePlaylist, sort_pattern_genre, false);
            break;
        case 150:
            plman.SortByFormat(plman.ActivePlaylist, sort_pattern_rating, false);
            break;
        case 160:
            plman.SortByFormat(plman.ActivePlaylist, sort_pattern_date, false);
            break;
        case 170:
            plman.SortByFormat(plman.ActivePlaylist, sort_pattern_bitrate, false);
            break;
        case 180:
            plman.SortByFormat(plman.ActivePlaylist, sort_pattern_path, false);
            break;
        case 190:
            plman.SortByFormat(plman.ActivePlaylist, sort_pattern_length, false);
            break;
        case 191:
            plman.SortByFormat(plman.ActivePlaylist, "", false);
            break;
        case 192:
            fb.RunMainMenuCommand("Edit/Sort/Reverse");
            break;
        case 200:
            group.type = 0;
		window.SetProperty("系統|群組模式", group.type);
            group.key = group_pattern_album;
		window.SetProperty("系統|群組關鍵字", group.key);
            tf_group_key = fb.TitleFormat(group.key);
            //
            redraw_stub_images();
            g_image_cache = new image_cache;
            CollectGarbage();
            plman.SortByFormat(plman.ActivePlaylist, "%album artist% | %date% | %album% | %discnumber% | %tracknumber% | %title%", false);
            break;
        case 201:
            group.type = 1;
		window.SetProperty("系統|群組模式", group.type);
            group.key = group_pattern_artist;
		window.SetProperty("系統|群組關鍵字", group.key);
            tf_group_key = fb.TitleFormat(group.key);
            //
            redraw_stub_images();
            g_image_cache = new image_cache;
            CollectGarbage();
            plman.SortByFormat(plman.ActivePlaylist, "%artist% | %date% | %album% | %discnumber% | %tracknumber% | %title%", false);
            break;
        case 202:
            group.type = 2;
		window.SetProperty("系統|群組模式", group.type);
            group.key = group_pattern_path;
		window.SetProperty("系統|群組關鍵字", group.key);
            tf_group_key = fb.TitleFormat(group.key);
            //
            redraw_stub_images();
            g_image_cache = new image_cache;
            CollectGarbage();
            plman.SortByFormat(plman.ActivePlaylist, "%path%", false);
            break;
        default:

    };
    _sort.Dispose();
    _groupby.Dispose();
    _menu.Dispose();
    g_menu_displayed = false;
    // collapse toolbar
    if(!toolbar.lock) {
        if(toolbar.delta==0) {
            toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
            toolbar.timerID_on = false;
        };
        if(toolbar.state) {
            if(!toolbar.timerID_off) {
                if(toolbar.delta == toolbar.collapsed_y*-1) {
                    toolbar.timerID_off = window.SetTimeout(function() {
                        if(!toolbar.timerID2) {
                            toolbar.timerID2 = window.SetInterval(function() {
                                toolbar.delta -= toolbar.step;
                                if(toolbar.delta <= 0) {
                                    toolbar.delta = 0;
                                    toolbar.state = false;
                                    window.ClearInterval(toolbar.timerID2);
                                    toolbar.timerID2 = false;
                                };
                                window.RepaintRect(0, 0, ww, 30);
                            }, 30);
                        } ;
                        toolbar.timerID_off && window.ClearTimeout(toolbar.timerID_off);
                        toolbar.timerID_off = false;
                    }, 400);
                };
            };   
        };
    };
    return true;
};

function settings_menu(x, y) {
    var idx;
    var _menu = window.CreatePopupMenu();
    var _columns = window.CreatePopupMenu();
    var _appearance = window.CreatePopupMenu();
    
	_menu.AppendMenuItem(MF_STRING, 1, "鎖定工具列");
    _menu.CheckMenuItem(1, toolbar.lock?1:0);
    _menu.AppendMenuSeparator();
    
	_appearance.AppendTo(_menu, MF_STRING, "外觀");
	_appearance.AppendMenuItem(MF_STRING, 100, "使用系統主題");
    _appearance.CheckMenuItem(100, panel.themed?1:0);
	_appearance.AppendMenuItem(MF_STRING, 110, "使用自訂色彩");
    _appearance.CheckMenuItem(110, panel.custom_colors?1:0);
	_appearance.AppendMenuItem(MF_STRING, 120, "隱藏群組標題");
    _appearance.CheckMenuItem(120, panel.nogroupheader?1:0);
	_appearance.AppendMenuItem(MF_STRING, 130, "邊框陰影（凹陷特效）");
    _appearance.CheckMenuItem(130, panel.show_shadow_border?1:0);
	_appearance.AppendMenuItem(MF_STRING, 140, "顯示卷軸");
    _appearance.CheckMenuItem(140, vscrollbar.show?1:0);

	_columns.AppendTo(_menu, MF_STRING, "欄位");
	_columns.AppendMenuItem(MF_STRING, 200, "播放圖示");
    _columns.CheckMenuItem(200, columns.playicon?1:0);
	_columns.AppendMenuItem(MF_STRING, 210, "曲目編號");
    _columns.CheckMenuItem(210, columns.tracknumber?1:0);
    _columns.AppendMenuSeparator();
	_columns.AppendMenuItem(MF_STRING, 330, "標題");
	_columns.AppendMenuItem(MF_STRING, 331, "標題（智慧）");
	_columns.AppendMenuItem(MF_STRING, 332, "標題 - 歌手");
    _columns.CheckMenuRadioItem(330, 332, columns.title+330);
    _columns.AppendMenuSeparator();
	_columns.AppendMenuItem(MF_STRING, 300, "播放次數");
    _columns.CheckMenuItem(300, columns.playcount?1:0);
	_columns.AppendMenuItem(MF_STRING, 310, "歌曲評等");
    _columns.CheckMenuItem(310, columns.rating?1:0);
	_columns.AppendMenuItem(MF_STRING, 320, "我的最愛");
    _columns.CheckMenuItem(320, columns.mood?1:0);
	_columns.AppendMenuItem(MF_STRING, 340, "位元速率");
    _columns.CheckMenuItem(340, columns.bitrate?1:0);
    
    _menu.AppendMenuSeparator();
    _menu.AppendMenuItem(fb.IsPlaying?MF_STRING:MF_GRAYED|MF_DISABLED, 6, "移到目前播放曲目");
    _menu.AppendMenuItem(plman.IsPlaybackQueueActive()?MF_STRING:MF_GRAYED|MF_DISABLED, 7, "顯示播放清單佇列");
    _menu.AppendMenuItem((cover.show && list.total>0 && group.nbrows>1)?MF_STRING:MF_DISABLED|MF_GRAYED, 8, "更新專輯封面");
    _menu.AppendMenuSeparator();
    if(!stats.foo_playcount) {
		_menu.AppendMenuItem(MF_STRING, 10, "啟用播放統計");
        _menu.CheckMenuItem(10, stats.enabled?1:0);
        _menu.AppendMenuSeparator();
    };
	_menu.AppendMenuItem(MF_STRING, 20, "內容");
	_menu.AppendMenuItem(MF_STRING, 21, "腳本");
    idx = _menu.TrackPopupMenu(x, y);
    
    switch(idx) {
        case 1:
            toolbar.lock = !toolbar.lock;
		window.SetProperty("系統|鎖定工具列", toolbar.lock);
            break;
        case 6:
            if(plman.ActivePlaylist != plman.PlayingPlaylist) {
                if(list.handlelist) list.handlelist.Dispose();
                list.handlelist = plman.GetPlaylistItems(fb.PlayingPlaylist);
                list.total = list.handlelist.Count;
                plman.ActivePlaylist = plman.PlayingPlaylist;
            } else {
                ShowNowPlaying();
                window.Repaint();
            };
            break;
        case 7:
            ShowPlaylistQueue(0);
            break;
        case 8:
            redraw_stub_images();
            g_image_cache = new image_cache;
            CollectGarbage();
            refresh_playlist_content();
            break;
        case 10:
            stats.enabled = !stats.enabled;
		window.SetProperty("系統|播放統計", stats.enabled);
            break;
        case 20:
            window.ShowProperties();
            break;
        case 21:
            window.ShowConfigure();
            break;
        case 100:
            panel.themed = !panel.themed;
		window.SetProperty("外觀|系統主題", panel.themed);
            if(panel.themed) {
                panel.theme = window.CreateThemeManager("scrollbar");
            } else {
                panel.theme = false;
            };
            recalc_datas();
            init_icons();
            set_scroller();
            window.Repaint();
            break;
        case 110:
            panel.custom_colors = !panel.custom_colors;
		window.SetProperty("外觀|顏色|自訂色彩", panel.custom_colors);
            on_colors_changed();
            break;
        case 120:
            panel.nogroupheader = !panel.nogroupheader;
		window.SetProperty("外觀|隱藏群組標題", panel.nogroupheader);
            recalc_datas();
            redraw_stub_images();
            refresh_playlist_content();
            break;
        case 130:
            panel.show_shadow_border = !panel.show_shadow_border;
		window.SetProperty("外觀|邊框陰影", panel.show_shadow_border);
            window.Repaint();
            break;
        case 140:
            vscrollbar.show = !vscrollbar.show;
		window.SetProperty("外觀|卷軸", vscrollbar.show);
            if(list.item.length>list.nbvis) {
                if(vscrollbar.show) {
                    vscrollbar.visible = true;
                } else {
                    vscrollbar.visible = false;
                };
            } else {
                vscrollbar.visible = false;
            };
            refresh_playlist_content();
            break;
        case 200:
            columns.playicon = !columns.playicon;
		window.SetProperty("外觀|欄位|播放圖示", columns.playicon);
            refresh_spv(plman.ActivePlaylist, true);
            break;
        case 210:
            columns.tracknumber = !columns.tracknumber;
		window.SetProperty("外觀|欄位|曲目編號", columns.tracknumber);
            refresh_spv(plman.ActivePlaylist, true);
            break;
        case 300:
            columns.playcount = !columns.playcount;
		window.SetProperty("外觀|欄位|播放次數", columns.playcount);
            refresh_spv(plman.ActivePlaylist, true);
            break;
        case 310:
            columns.duration_w = 0;
            columns.bitrate_w = 0;
            columns.rating = !columns.rating;
		window.SetProperty("外觀|欄位|歌曲評等", columns.rating);
            refresh_spv(plman.ActivePlaylist, true);
            break;
        case 320:
            columns.duration_w = 0;
            columns.bitrate_w = 0;
            columns.mood = !columns.mood;
		window.SetProperty("外觀|欄位|我的最愛", columns.mood);
            refresh_spv(plman.ActivePlaylist, true);
            break;
        case 340:
            columns.duration_w = 0;
            columns.bitrate_w = 0;
            columns.bitrate = !columns.bitrate;
		window.SetProperty("外觀|欄位|位元速率", columns.bitrate);
            refresh_spv(plman.ActivePlaylist, true);
            break;
        case 330:
        case 331:
        case 332:
            columns.title = idx - 330;
		window.SetProperty("外觀|欄位|歌曲標題|模式", columns.title);
            window.Repaint();
            break;
        default:

    };
    _appearance.Dispose();
    _columns.Dispose();
    _menu.Dispose();
    g_menu_displayed = false;
    // collapse toolbar
    if(!toolbar.lock) {
        if(toolbar.delta==0) {
            toolbar.timerID_on && window.ClearTimeout(toolbar.timerID_on);
            toolbar.timerID_on = false;
        };
        if(toolbar.state) {
            if(!toolbar.timerID_off) {
                if(toolbar.delta == toolbar.collapsed_y*-1) {
                    toolbar.timerID_off = window.SetTimeout(function() {
                        if(!toolbar.timerID2) {
                            toolbar.timerID2 = window.SetInterval(function() {
                                toolbar.delta -= toolbar.step;
                                if(toolbar.delta <= 0) {
                                    toolbar.delta = 0;
                                    toolbar.state = false;
                                    window.ClearInterval(toolbar.timerID2);
                                    toolbar.timerID2 = false;
                                };
                                window.RepaintRect(0, 0, ww, 30);
                            }, 30);
                        } ;
                        toolbar.timerID_off && window.ClearTimeout(toolbar.timerID_off);
                        toolbar.timerID_off = false;
                    }, 400);
                };
            };   
        };
    };
    return true;
};

//=================================================// Drag'n'Drop Callbacks
var wsh_dragging = false;

function on_drag_enter() {
    wsh_dragging = true;
};

function on_drag_leave() {
    wsh_dragging = false;
};

function on_drag_over(action, x, y, mask) {
    on_mouse_move(x, y);
};

function on_drag_drop(action, x, y, mask) {
    wsh_dragging = false;
    // We are going to process the dropped items to a playlist
    action.ToPlaylist();
    action.Playlist = plman.ActivePlaylist;
    action.ToSelect = false;
};

//=================================================// Queue Playlist features

function on_playback_queue_changed(origin) {
    if(isQueuePlaylistActive()) {
        ShowPlaylistQueue(0);
    } else {
        SetPlaylistQueue();
    };
};

function isQueuePlaylistActive() {
    var queue_pl_idx = isQueuePlaylistPresent();
    if(queue_pl_idx<0) {
        return false;
    } else if(plman.ActivePlaylist == queue_pl_idx) {
        return true;
    };
};

function isQueuePlaylistPresent() {
    for(var i=0; i<plman.PlaylistCount; i++) {
        if(plman.GetPlaylistName(i)=="播放清單佇列") return i;
    };
    return -1;    
};

function SetPlaylistQueue() {
    var total_pl = plman.PlaylistCount;
    var queue_pl_idx = isQueuePlaylistPresent();
    if(queue_pl_idx<0) {
        return true;
    } else {
        var total_in_pls = plman.PlaylistItemCount(queue_pl_idx);
        if(total_in_pls > 0) {
            var affected_items = Array();
            for(var i=0; i<total_in_pls; i++) {
                affected_items.push(i);
            };
            plman.SetPlaylistSelection(queue_pl_idx, affected_items, true);
            plman.RemovePlaylistSelection(queue_pl_idx);
        };
    };
    var queue_total = plman.GetPlaybackQueueCount();
    var vbarr = plman.GetPlaybackQueueContents();
    var arr = vbarr.toArray();
    var q_handlelist = plman.GetPlaylistSelectedItems(queue_pl_idx);
    q_handlelist.RemoveAll();
    for(var j=0; j<queue_total; j++) {
        q_handlelist.Add(arr[j].Handle);
    };
    plman.InsertPlaylistItems(queue_pl_idx, j, q_handlelist, false);
};

function ShowPlaylistQueue(focus_id) {
    var total_pl = plman.PlaylistCount;
    var queue_pl_idx = isQueuePlaylistPresent();
    if(queue_pl_idx<0) {
        plman.CreatePlaylist(total_pl, "播放清單佇列");
        queue_pl_idx = total_pl;
        plman.ActivePlaylist = queue_pl_idx;
    } else {
        plman.ActivePlaylist = queue_pl_idx;
        fb.ClearPlaylist();
    };
    var queue_total = plman.GetPlaybackQueueCount();
    var vbarr = plman.GetPlaybackQueueContents();
    var arr = vbarr.toArray();
    var q_handlelist = plman.GetPlaylistSelectedItems(queue_pl_idx);
    q_handlelist.RemoveAll();
    for(var i=0; i<queue_total; i++) {
        q_handlelist.Add(arr[i].Handle);
    };
    plman.InsertPlaylistItems(queue_pl_idx, i, q_handlelist, false);
    plman.SetPlaylistFocusItem(queue_pl_idx, focus_id);
};
