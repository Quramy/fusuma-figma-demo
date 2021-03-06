const path = require("path");
const fs = require("fs");
const { parse } = require('url');
const querystring = require('querystring');

const gulp = require("gulp");
const replace = require("gulp-replace");
const rp = require("request-promise");
const imgDownload = require("image-downloader");

const token = fs.readFileSync(".figmatoken", "utf-8").trim();

let images = [];

function copyAssets() {
  return gulp.src(["assets/**/*"]).pipe(gulp.dest("dist/assets"));
}

function copy() {
  return gulp.src([".fusumarc.yml", "styles.css"]).pipe(gulp.dest("fusuma_wd"));
}

function replaceIframe() {
  images = [];
  return gulp.src("slides/**/*.md")
    .pipe(replace(/<iframe ([^>]*)>[^<]*<\/iframe>/g, (all, a) => {
      const src = a.split(/\s+/).filter(x => x.startsWith("src=")).map(x => x.match(/src="(.*)"/)[1])[0]
      if (!src.startsWith("https://www.figma.com/embed")) return all;
      console.warn("find iframe for", src);
      const url = parse(src);
      const fileUrl = parse((querystring.parse(url.query).url));
      const fileId = fileUrl.pathname.split("/")[2]
      const nodeId = querystring.parse(fileUrl.query)["node-id"];
      const imgName = `${fileId}__${nodeId}.png`;
      images.push({ fileId, nodeId, imgName });
      return `<img className="figma_fig" src="./${imgName}" />`;
    }))
    .pipe(gulp.dest("fusuma_wd/slides"));
}

function fetch() {
  return Promise.all(images.map(async ({ imgName, nodeId, fileId }) => {
    const res = await rp({
      url: `https://api.figma.com/v1/images/${fileId}?ids=${nodeId}&format=png&scale=2.0`,
      headers: {
        "X-FIGMA-TOKEN": token,
      },
      json: true,
    });
    const imgUrl = res.images[nodeId];
    await imgDownload.image({ url: imgUrl, dest: `fusuma_wd/slides/${imgName}` });
    console.log("Donloaded", imgUrl, imgName);
  }));
}

function copyDist() {
  return gulp.src(["fusuma_wd/dist/**/*"])
    .pipe(gulp.dest("dist"));
}

exports.default = gulp.series(copy, replaceIframe, fetch);
exports.copyDist = gulp.series(copyDist);
