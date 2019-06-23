## LTや発表の登壇資料、何で作っていますか？

---

## 最近、fusumaに乗り換えてみました

[https://github.com/hiroppy/fusuma/issues](https://github.com/hiroppy/fusuma/issues)

---

## fusumaの特徴

Markdown(MDX)でスライドが書ける

---

## コードも貼れる

prismによるSyntax highlight

```typescript
function hoge() {
  return "hoge";
}
```

---

## :smile:

絵文字使える


```md
## :smile:

絵文字使える
```

---

## .mdでスライドできるよ！系のツールで困ることが...

---

# **ポンチ絵**

---

## ちょっと図をいじるたびに...

* Sketchでpngにexport
* パスを.mdに貼り付け

### ダルい :innocent:

---

## Figma使えないかしら？

<iframe width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FWq8Q2ugeRMAuvbh0y5M5yEWr%2Ffusuma-figma-demo%3Fnode-id%3D2%253A2" allowfullscreen></iframe>

---

## Figma embed 

> There’s a range of reasons why you might want a live, **always up to date Figma file to populate on your website**. Perhaps you’re showing off your design portfolio so people can see the latest samples of your work.

[Figma Live Embed](https://www.figma.com/developers/embed)


---

## やってみた＆demo

<iframe width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FWq8Q2ugeRMAuvbh0y5M5yEWr%2Ffusuma-figma-demo%3Fnode-id%3D27%253A0" allowfullscreen></iframe>

---

## 結局使い物にならない

* 特にfigma iframeのロードが重すぎる

---

## 仕方ないので

---

## 漢は黙ってgulpfile.js

---

.mdにあるiframeをimgで置換。合わせてfigmaのfileIdと選択してるframeのidを覚えておく

```javascript
function replaceIframe() {
  images = [];
  return gulp.src("slides/**/*.md")
    .pipe(replace(/<iframe ([^>]*)>[^<]*<\/iframe>/g, (all, a) => {
      const src = a.split(/\s+/).filter(x => x.startsWith("src=")).map(x => x.match(/src="(.*)"/)[1])[0]
      if (!src.startsWith("https://www.figma.com/embed")) return all;
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
```

---

記憶したfileId、frameのidを元にfigma APIぶっ叩いてpngにexport


```javascript
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
```

---

## まとめ

* fusumaはいいぞ
* figmaはいいぞ

---

# Thank you!
