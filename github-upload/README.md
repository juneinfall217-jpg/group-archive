# 小组项目资料库使用说明

这是一个可以直接打开的网页资料库模板，适合整理老师分享的大量图片资料。

## 怎么放图片

在这个文件夹里新建 `images` 文件夹，再按主题分子文件夹，例如：

```text
images/
  background/
  field/
  reference/
```

把图片放进去后，打开 `data.js`，把示例资料改成真实资料：

```js
{
  title: "图片标题",
  category: "背景资料",
  source: "老师分享",
  note: "这张图的用途或说明",
  image: "images/background/your-image.jpg",
  tags: ["重点", "适合汇报"],
  featured: true
}
```

## 建议的分类

- 背景资料
- 实地图片
- 参考案例
- 数据截图
- 设计素材
- 汇报可用

## 分享方式

第一阶段可以直接把整个文件夹发给组员，打开 `index.html` 就能看。

如果你们希望别人只点一个链接就能访问，可以把这个文件夹发布到 GitHub Pages、Cloudflare Pages、Netlify 或学校提供的网站空间。
