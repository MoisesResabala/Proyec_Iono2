const labf = ["1.4", "2.0", "2.8", "4.0", "5.6", "8.0", "11.3", "16 MHz."];
const labh = ["100", "200", "300", "400", "500", "600", "700", "km."];
const mask = 0x80;
const xmin = 40;
const xmax = 616;
const ymax = 478;
const anchoVentana = 650;
const altoVentana = 500;
const oReq = new XMLHttpRequest();

let archivo = document.getElementsByName("archivo")[0].value;
let iono = document.getElementsByName("iono")[0].value;

oReq.open("GET", "/api/b?archivo=" + archivo, true);
oReq.responseType = "arraybuffer";

let fnum, fsize, fsite, fofset, fyear, fmonth, fday, fhour, fminute, fsecond, fflags;
let inum, ilcol, ircol, iheight, isize, imonth, iday, ihour, iminute, isecond, iflags;
let data;
let xp, yp, sh, ht, ytop, ymin;
let arrayBuffer;

let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");

oReq.onload = () => {
  arrayBuffer = oReq.response;
  if (arrayBuffer) {
    leeYdibuja();
  }
};

oReq.send(null);

function cambioArchivo() {
  archivo = document.getElementsByName("archivo")[0].value;
  iono = document.getElementsByName("iono")[0].value;
  oReq.open("GET", "/api/b?archivo=" + archivo, true);
  oReq.responseType = "arraybuffer";

  arrayBuffer = oReq.response;
  if (arrayBuffer) {
    leeYdibuja();
  }
  oReq.send(null);
}

function cambioIono() {
  iono = document.getElementsByName("iono").value;
  if (arrayBuffer) {
    leeYdibuja();
  }
}

function leeYdibuja() {
  fnum = new Int16Array(arrayBuffer.slice(0, 2))[0];
  fsize = new Int32Array(arrayBuffer.slice(2, 6))[0];
  fsite = new Int8Array(arrayBuffer.slice(6, 7))[0];
  fofset = new Int8Array(arrayBuffer.slice(7, 8))[0];
  fyear = new Int16Array(arrayBuffer.slice(8, 10))[0];
  fmonth = new Int8Array(arrayBuffer.slice(10, 11))[0];
  fday = new Int8Array(arrayBuffer.slice(11, 12))[0];
  fhour = new Int8Array(arrayBuffer.slice(12, 13))[0];
  fminute = new Int8Array(arrayBuffer.slice(13, 14))[0];
  fsecond = new Int8Array(arrayBuffer.slice(14, 15))[0];
  fflags = new Int8Array(arrayBuffer.slice(15, 16))[0];
  let pos = 16;
  for (let i = 0; i < fnum; i++) {
    inum = new Int16Array(arrayBuffer.slice(pos, pos + 2))[0];
    ilcol = new Int16Array(arrayBuffer.slice(pos + 2, pos + 4))[0];
    ircol = new Int16Array(arrayBuffer.slice(pos + 4, pos + 6))[0];
    iheight = new Int16Array(arrayBuffer.slice(pos + 6, pos + 8))[0];
    isize = new Int16Array(arrayBuffer.slice(pos + 8, pos + 10))[0];
    imonth = new Int8Array(arrayBuffer.slice(pos + 10, pos + 11))[0];
    iday = new Int8Array(arrayBuffer.slice(pos + 11, pos + 12))[0];
    ihour = new Int8Array(arrayBuffer.slice(pos + 12, pos + 13))[0];
    iminute = new Int8Array(arrayBuffer.slice(pos + 13, pos + 14))[0];
    isecond = new Int8Array(arrayBuffer.slice(pos + 14, pos + 15))[0];
    iflags = new Int8Array(arrayBuffer.slice(pos + 15, pos + 16))[0];
    data = new Uint8Array(arrayBuffer.slice(pos + 16, pos + 16 + isize * 16));
    pos += 16 + 16 * isize;
    if (i == iono - 1)
      break;
  }
  dibuja();
}

function dibuja() {
  let filofset = fofset;
  if (filofset > 0)
    filofset = filofset - 32 + (filofset / 100) * 412;
  let bitofset = filofset;

  xp = xmin + ilcol - 1;
  ht = iheight;
  sh = 7;
  if (ht < 38)
    sh = 14;
  ymin = ymax - ht * sh;
  ytop = ymin + 3;
  yp = ymax - bitofset + Math.floor((bitofset + 5) / 8);

  let i = 0;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, anchoVentana, altoVentana);
  ctx.fillStyle = "blue";
  while (true) {
    let bite = data[i];
    i += 1;
    if (bite != 0) {
      for (let k = 0; k < 7; k++) {
        if (bite & mask) {
          ctx.fillRect(xp, yp, 1, 1);
        }
        bite <<= 1;
        yp -= 1;
        if (ht < 38) {
          yp -= 1;
        }
      }
    } else {
      let nz = data[i];
      i += 1;
      yp -= (nz * sh);
      if (nz == 0) {
        break;
      }
    }
    while (yp < ytop) {
      yp += ht * sh;
      xp += 1;
    }
  }

  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
  ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);
  ctx.font = "15px Arial";
  let lf = 0;
  for (let k = xmin + 64; k <= 600 - 1; k += 64) {
    ctx.fillText(labf[lf], k - 9, ymax - 18);
    lf += 1;
    ctx.fillRect(k, ymax - 15, 1, 15);
    ctx.fillRect(k, ymin, 1, 7);
  }
  let lh = 0;
  for (let k = ymax - 56; k >= ytop + 1; k -= 56) {
    ctx.fillText(labh[lh], xmin - 35, k + 4);
    lh += 1;
    ctx.fillRect(xmin, k, 7, 1);
    ctx.fillRect(xmax - 7, k, 7, 1);
  }
  ctx.fillText(labh[7], xmin - 25, ytop + 20);
  strg = "J3P " + iday.toString().padStart(2, '0') + "/" + imonth.toString().padStart(2, '0') +
    "/" + fyear + " at " + ihour.toString().padStart(2, '0') + ":" +
    iminute.toString().padStart(2, '0') + "." + Math.round(isecond / 6)

  ctx.font = "28px Arial";
  ctx.fillText(strg, xmin, 25);
}

let LAB = ["", "E", "F", "m", "s", "h", "H", "M"];
let colr = ['Black', 'Green', 'Red', 'Blue', 'DarkCyan', 'White', 'Cyan', 'Magenta'];
let fon = [0, 2.8284, 8.0, 1.4142, 4.0, 100, 200, 6.];
let FR = 1;
let F2C = 184.665;
let FH120 = [1.45, 1.45, 1.55, 1.3, 1.3, 1.3];

const dibujar_cambio = (lay, element) => {
  const elementIsChecked = document.getElementById(element).checked;
  if (elementIsChecked) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "red";
    ctx.fillText('SCALING', xmin + 7, ymin + 25);

    const yt = [0, (ymin * 3 + ymax) / 4, ymin, (ymin + ymax) / 2, (ymin + ymax * 3) / 4];
    const FH2E = FH120[fsite] * 0.5;

    ctx.fillStyle = colr[lay];
    ctx.fillText(LAB[lay], xmin + 20 * lay + 112, ymin + 25);

    const FO = fon[lay] * FR;
    const cop = Math.floor(Math.log(FO) * F2C + 1.5) + xmin;
    ctx.fillRect(cop, yt[lay], 1, ymax - yt[lay]);

    if (lay <= 2) {
      const FH2 = lay == 2 ? FH2E * .9212 : FH2E;
      const FX = Math.sqrt(FH2 * FH2 + FO * FO) + FH2;
      const cxp = Math.floor(Math.log(FX) * F2C + 1.5) + xmin;
      draw_dashed_line(cxp, Math.floor(yt[lay]), cxp, ymax, colr[lay]);
    }
    if (lay === 5) {
      let cxp = cop * 2 - ymax;
      ctx.fillRect(xmin, cxp, yt[lay] - xmin, 1);
    }
    if (lay === 6) {
      let cxp = cop * 2 - ymax;
      let c3p = cxp * 2 - cop;
      ctx.fillRect(xmin, cop, yt[lay] - xmin, 1);
      ctx.fillRect(xmin, cxp, yt[lay] - xmin, 1);
      if (c3p > ymin)
        ctx.fillRect(xmin, c3p, yt[lay] - xmin, 1);
    }
    if (lay === 7) {
      let muf = [cop, ymax - 112, cop + 22, ymax - 140, cop + 41, ymax - 168, cop + 58, ymax - 196,
        cop + 72, ymax - 224, cop + 97, ymax - 280, cop + 118, ymax - 336, cop + 135, ymax - 392];
      ctx.strokeStyle = colr[lay];
      ctx.beginPath();
      ctx.moveTo(muf[0], muf[1]);
      for (let i = 2; i <= 14; i += 2)
        ctx.lineTo(muf[i], muf[i + 1]);
      ctx.stroke();
    }
  } else {
    dibuja();
  }
}

const draw_dashed_line = (x1, y1, x2, y2, color) => {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}
