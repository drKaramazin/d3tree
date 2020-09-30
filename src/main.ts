import {Direction, Type, LinkType} from "@models/revisions/revision-tree-model";
import {RevisionsTree} from "./revisions-tree";
import data from "./data.json";

const canvas = document.querySelector('#revisionsTree');
console.log(Direction.BOTTOM_TOP);
const tree = new RevisionsTree(<HTMLElement>canvas, data, Direction.BOTTOM_TOP, Type.TREE, LinkType.CURVES);
tree.draw();

