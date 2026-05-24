# AEMEATH Hex Map Editor

> **A**dorable **E**ditor for **M**anaging and **E**ngineering **A**rknights-inspired **T**iled **H**exmaps.

[中文](#中文) | [English](#english)

![AEMEATH Hex Map Editor preview](public/aemeath-hex-map-editor-preview.png)

## 中文

AEMEATH Hex Map Editor 是一个本地优先的浏览器六边形地图编辑器，用于制作风格化的地形图与政治地图。

项目目前处于 alpha 阶段。它已经可以用于尝试世界、地形、国家、省份、城市、标签、图标和子地图等编辑流程，但数据结构和 UI 仍可能继续变化。

### 功能

- 六边形网格世界编辑，支持本地项目保存与读取。
- 地形表面与高度/地貌绘制。
- 国家、省份、城市编辑，包含侧边表格和属性面板。
- 文本标签、图标标签、标签组、自动绑定标签和样式控制。
- 鼠标堆叠菜单与键盘快捷键浮层，用于快速执行常用地图操作。
- 本地图标管理，以及可选的图标嵌入项目文件导出。
- 英文、法文、中文 UI 的基础多语言支持。

### 快速开始

```bash
npm install
npm run dev
```

然后打开终端中 Vite 显示的本地地址。

构建检查：

```bash
npm run build
```

预览生产构建：

```bash
npm run preview
```

### 转换脚本

```bash
python -m pip install Pillow
python scripts/image_to_hex_matrix.py input.png --width 64 --height 64
python scripts/hex_matrix_to_aemeath_project.py input.hex-matrix.json --name "My World"
```

第一个脚本把图片转换为 `hex-color-matrix` JSON；第二个脚本把该矩阵转换为可在 AEMEATH 中打开的项目 JSON。

### 项目结构

- `src/`：编辑器 UI、状态、领域模型、渲染和功能控制器。
- `public/`：内置图标和静态资源。
- `scripts/`：用于把图像 / hex matrix 数据转换为项目输入的工具脚本。
- `package.json`：开发脚本和依赖。

### 许可证

本项目使用 MIT License。详见 [LICENSE](LICENSE)。

## English

AEMEATH Hex Map Editor is a local-first browser hex map editor for creating stylized terrain and political maps.

The project is currently in alpha. It is usable for experimenting with world, terrain, country, province, city, label, icon, and submap workflows, but the data model and UI may still change.

### Features

- Hex-grid world editing with local project save/load.
- Terrain surface and topography painting.
- Country, province, and city editing with side tables and inspectors.
- Text labels, icon labels, label groups, assigned labels, and label style controls.
- Mouse-stacked quick menu and keyboard shortcut overlay for common map actions.
- Local icon management and optional embedded-icon project export.
- Basic multilingual UI support for English, French, and Chinese.

### Quick Start

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

Build check:

```bash
npm run build
```

Preview a production build:

```bash
npm run preview
```

### Conversion Scripts

```bash
python -m pip install Pillow
python scripts/image_to_hex_matrix.py input.png --width 64 --height 64
python scripts/hex_matrix_to_aemeath_project.py input.hex-matrix.json --name "My World"
```

The first script converts an image into `hex-color-matrix` JSON. The second script converts that matrix into an AEMEATH project JSON file.

### Project Layout

- `src/`: editor UI, state, domain model, rendering, and feature controllers.
- `public/`: built-in icons and static assets.
- `scripts/`: utility scripts for converting image / hex matrix data into project-friendly inputs.
- `package.json`: development scripts and dependencies.

### License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
