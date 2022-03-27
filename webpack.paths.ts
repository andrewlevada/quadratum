import path from "path";

const paths = {
    src: path.join(__dirname, "/src"),
    build: path.join(__dirname, "/build"),
    nodeModules: path.resolve(__dirname, "node_modules"),
    pages: path.join(__dirname, "/src/pages"),
};

export default paths;
