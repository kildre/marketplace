// @src/data/mock-productData.ts

import { Product, ProductItems } from "../types/products";

const data: Product[] = [
  {
    id: 1,
    type: "License Based",
    name: "AWS",
    description:
      "Cloud computing platform offering scalable infrastructure and services.",
    price: 500,
    unit: 100,
    inCart: false,
    currentlyInCart: 0,
    cartStatus: "available",
  },
  {
    id: 2,
    type: "License Based",
    name: "C3AI",
    description:
      "Enterprise AI software for accelerating digital transformation.",
    price: 400,
    unit: 200,
    inCart: false,
    currentlyInCart: 0,
    cartStatus: "available",
  },
  {
    id: 3,
    type: "Consumption Based Tool",
    name: "Databricks",
    description: "Unified platform for data engineering, analytics, and AI.",
    price: null,
    unit: 100,
    inCart: false,
    currentlyInCart: 0,
    cartStatus: "available",
    rom: "Custom ROM",
  },
  {
    id: 4,
    type: "Consumption Based Tool",
    name: "DataRobot",
    description:
      "AI lifecycle platform for building and deploying machine learning models.",
    price: 600,
    unit: 500,
    inCart: false,
    currentlyInCart: 0,
    cartStatus: "available",
  },
  {
    id: 5,
    type: "License Based",
    name: "Gitlab",
    description:
      "DevOps platform enabling source code management and CI/CD pipelines.",
    price: 0,
    unit: 100,
    inCart: false,
    currentlyInCart: 0,
    cartStatus: "available",
  },
  {
    id: 6,
    type: "License Based",
    name: "Palantir",
    description:
      "Data integration and analytics platform for large-scale decision-making.",
    price: 299,
    unit: 100,
    inCart: false,
    currentlyInCart: 0,
    cartStatus: "available",
  },
  {
    id: 7,
    type: "License Based",
    name: "Tableau",
    description:
      "Interactive data visualization software for business intelligence.",
    price: 200,
    unit: 100,
    inCart: false,
    currentlyInCart: 0,
    cartStatus: "available",
  },
  {
    id: 8,
    type: "License Based",
    name: "UI Path",
    description:
      "Robotic process automation (RPA) software for automating workflows.",
    price: 275,
    unit: 100,
    inCart: false,
    currentlyInCart: 0,
    cartStatus: "available",
  },
];

export const mockProducts: ProductItems = {
  items: data,
  itemCount: data.length,
  pageCount: 1,
  prevPage: null,
  nextPage: null,
};
