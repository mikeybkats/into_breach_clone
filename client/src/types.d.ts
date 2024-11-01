// Add type declaration for CSS module
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
