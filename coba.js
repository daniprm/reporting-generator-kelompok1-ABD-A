const myObject = {
  nama: "abc",
  kelas: "kls",
};
let tes = [];
Object.values(myObject).forEach((value) => {
  tes.push(value); // Output: abc, kls
});

console.log(Object.keys(myObject));
