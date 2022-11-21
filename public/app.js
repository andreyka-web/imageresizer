(function () {
  const side = 80;
  const quality = 100;

  function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  let inp = document.createElement("input");
  inp.type = "file";
  inp.multiple = true;
  inp.style.display = "none";
  inp.addEventListener("change", (e) => {
    if (inp.files.length === 0) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    handleFiles(inp.files);
  });

  let imgDropBox = document.querySelector("#imgDropBox");
  imgDropBox.addEventListener("click", (e) => inp.click());
  imgDropBox.addEventListener("dragenter", preventDefault, false);
  imgDropBox.addEventListener("dragleave", preventDefault, false);
  imgDropBox.addEventListener("dragover", preventDefault, false);
  imgDropBox.addEventListener("drop", preventDefault, false);
  function handleDrop(e) {
    let data = e.dataTransfer;
    handleFiles(data.files);
  }
  imgDropBox.addEventListener("drop", handleDrop, false);

  let imgbox = document.querySelector("#imgBox");

  function handleFiles(files) {
    Array.from(files).forEach((file, i) => {

      if( !(['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) ) {
        alert(`\n\n ${file.name} \n\n WRONG FILE FORMAT!`);
        return; // file type is not good
      }

      let row = imgbox.cloneNode(true);
      row.removeAttribute("id");
      document.querySelector(".imgList").prepend(row);

      let img = row.querySelector("img");
      let winp = row.querySelector("input[name=width]");
      let hinp = row.querySelector("input[name=height]");
      let q = quality;
      let canvas = document.createElement("canvas");

      createImageBitmap(file).then((bitmap) => {
        w = bitmap.width;
        h = bitmap.height;

        img.width = w >= h ? side : (side * w) / h;
        img.height = h >= w ? side : (side * h) / w;
        img.onload = () => {
          setDimentions(row, w, h);
          setQuality(row, q);
        };
        img.src = URL.createObjectURL(file);

        winp.setAttribute("max", w);
        hinp.setAttribute("max", h);
      });

      // time
      row.querySelector("figcaption.date").innerText = `${getTime()}`;
      
      // on resize by range
      row.querySelector("input[name=s]").addEventListener(
        "change",
        (e) => {
          let s = e.currentTarget.value;
          setDimentions(row, (w * s) / 100, (h * s) / 100, s);
        },
        false
      );

      // on resize by input width
      winp.addEventListener(
        "change",
        (e) => {
          let w =
            parseInt(winp.value) <= parseInt(winp.max)
              ? parseInt(winp.value)
              : parseint(winp.max);
          let s = (w / parseInt(winp.max)) * 100;
          let h = (parseInt(hinp.max) * s) / 100;
          setDimentions(row, w, h, s);
        },
        false
      );

      // on resize by input height
      hinp.addEventListener(
        "change",
        (e) => {
          let h =
            parseInt(hinp.value) <= parseInt(hinp.max)
              ? parseInt(hinp.value)
              : parseInt(hinp.max);
          let s = (h / parseInt(hinp.max)) * 100;
          let w = (parseInt(winp.max) * s) / 100;
          setDimentions(row, w, h, s);
        },
        false
      );

      // qality change
      row.querySelectorAll('input[name^="q"]').forEach((item) => {
        item.addEventListener("change", (e) =>
          setQuality(row, parseInt(e.currentTarget.value))
        );
      });

      // download
      row.querySelector("a.download").addEventListener("click", (e) => {
        let ctx = canvas.getContext("2d");
        let w = parseInt(winp.value);
        let h = parseInt(hinp.value);
        setCanvasSize(canvas, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        e.currentTarget.href = canvas.toDataURL(file.type, q);
        e.currentTarget.download = file.name;
        // e.currentTarget.download = `${Date.now()}-${w}x${h}-${q}.jpg`;
      });
    });
  }

  function setDimentions(row, w, h, s) {
    s = s || 100;
    row.querySelector("input[name=width]").value = w;
    row.querySelector("input[name=height]").value = h;
    row.querySelector("input[name=s]").value = s;
  }

  function setCanvasSize(canvas, w, h) {
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);
  }

  function setQuality(row, q) {
    q = q || 100;
    row.querySelector("input[name=q]").value = q;
    row.querySelector("input[name=quality]").value = q;
  }

  function getTime() {
    let d = new Date();
    let m = addLeadingZero(d.getMinutes());
    let s = addLeadingZero(d.getSeconds());
    return `${d.getHours()}:${m}:${s}`;
  }

  function addLeadingZero(num) {
    return ("0" + num.toString()).slice(-2);
  }
})();
