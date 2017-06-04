# Changes

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
