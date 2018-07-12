# Changes

## 1.3.1

- 🐛 [`828738c`](https://github.com/javascript-studio/studio-log-x/commit/828738c2fbc3243a829dacbd5e182962c61ed27e)
  Fix handling of null and prototype-less objects

## 1.3.0

- 🍏 [`2b6c278`](https://github.com/javascript-studio/studio-log-x/commit/2b6c2780340b89ff696c1c9231a6aab1aacbf40c)
  Introduce `all` to combine the given x-out transforms

## 1.2.0

- 🍏 [`493378a`](https://github.com/javascript-studio/studio-log-x/commit/493378a6c4c8c9f0260943321999757ba1f2c995)
  Add `x.ns` API to create a transform for the given namespace
- 🐛 [`2abd3df`](https://github.com/javascript-studio/studio-log-x/commit/2abd3df80086492e8f7d73d1d8ba0d995ec08fe6)
  Make eslint happy
- ✨ [`b933b6d`](https://github.com/javascript-studio/studio-log-x/commit/b933b6d0f6e17a1d21bfdb318ab29bd6e444729a)
  Use Referee
- 📚 [`ee433ab`](https://github.com/javascript-studio/studio-log-x/commit/ee433ab975194e14947af6675c72fff245b15da1)
  Add commit links with `--commits`
- 📚 [`d1070ac`](https://github.com/javascript-studio/studio-log-x/commit/d1070aca4bb4620d2627b161dbbbe99634382099)
  Add install instructions
- 📚 [`db9a3b4`](https://github.com/javascript-studio/studio-log-x/commit/db9a3b485eb867248b19c0b41cbf090a07c5e476)
  Update install instruction

## 1.1.0

- 🍏 Support array index, quoted properties and wildcard properties.

    > - `items[0]`: Array index access.
    > - `item[':a']`: Quoted property access.
    > - `item.*`: All values in object
    > - `items[*]`: All entries in array.
    > - `item.*.key`: Property access in each value of object.
    > - `items[*].key`: Property access in each entry of array.

## 1.0.0

- ✨ Initial release
