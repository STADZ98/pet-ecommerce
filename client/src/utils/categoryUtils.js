export const getCategoryName = (cat) => {
  if (!cat) return "";
  if (typeof cat.name === "string") return cat.name;
  if (typeof cat.name === "object") return cat.name.th || cat.name.en || "";
  return "";
};

export const getCategoryImage = (cat) => {
  if (!cat) return "/img/default-category.png";
  if (typeof cat.images === "string") return cat.images;
  if (Array.isArray(cat.images) && cat.images.length > 0) return cat.images[0];
  if (cat.image) return cat.image;
  return "/img/default-category.png";
};
