// Test utils

const testBlock = (name) => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const getRealType = (value) => {
    // Return string with a “real” type of value.
    // For example:
    //     typeof new Date()       // 'object'
    //     getRealType(new Date()) // 'date'
    //     typeof NaN              // 'number'
    //     getRealType(NaN)        // 'NaN'
    // Use typeof, instanceof and some magic. It's enough to have
    // 12-13 unique types but you can find out in JS even more :)
    // Функция перенесена вверх из-за линтера
    let realType = typeof value;
    if (!['boolean', 'string', 'function', 'undefined', 'bigint'].includes(realType)) {
        // Дальнейшие проверки если тип неоднозначный
        if (realType === 'number') {
            // Для NaN и Infinity отдельный котёл
            if (isNaN(value)) {
                return 'NaN';
            }
            if (value > Number.MAX_VALUE || value < Number.MIN_VALUE) {
                return 'Infinity';
            }
        } else {
            realType = {}.toString.call(value).slice(8, -1).toLowerCase();
            // Секретная функция https://learn.javascript.ru/class-instanceof
        }
    }
    return realType;
    // В конце возвращаем реальный тип (чтобы хоть как-то функция сработала на типах, которые ещё не придумали)
};

const areEqual = (a, b) => {
    // Compare arrays of primitives
    // Remember: [] !== []
    const typea = getRealType(a);
    const typeb = getRealType(b);
    if (typea === 'array' && typeb === 'array') {
        // Еесли оба массивы - то сначала сравниваем длину
        // eslint-disable-next-line eqeqeq
        if (a.length != b.length) {
            return false;
        }
        // А затем - содержимое
        for (const key in a) {
            if (!areEqual(a[key], b[key])) {
                // Рекурсия для многомерности
                return false;
            }
        }
        return true;
    }
    return a === b;
};

function test(whatWeTest, actualResult, expectedResult, flagInverse) {
    // Функция дополнена флагом инверсии условия (чтобы ошибочные тесты проходить)
    // Переписана через ранний return чтобы не плодить else
    if (areEqual(actualResult, expectedResult)) {
        console.log(`[OK] ${whatWeTest}\n`);
        return;
    }
    if (flagInverse) {
        console.log(`[OK_inverse] ${whatWeTest}\n`);
        return;
    }
    console.error(`[FAIL] ${whatWeTest}`);
    console.debug('Expected:');
    console.debug(expectedResult);
    console.debug('Actual:');
    console.debug(actualResult);
    console.log('');
}

// Functions

const getType = (value) => {
    // Return string with a native JS type of value
    return typeof value;
};

const getTypesOfItems = (arr) => {
    // Return array with types of items of given array
    return arr.map((a) => getType(a));
    // Стрелочная функция
};

const allItemsHaveTheSameType = (arr) => {
    // Return true if all items of array have the same type
    const arr2 = getTypesOfItems(arr);
    if (!arr2.length) {
        // Если массива нету, то и однотипных элементов там нету
        return false;
    }
    for (const item of arr2) {
        // Тут первое с первым сравниваем (лишний раз), зато массив из одного элемента однотипным считаем и запись короче
        if (item !== arr2[0]) {
            return false;
        }
    }
    return true;
};

const countRealTypes = (arr) => {
    // Return an array of arrays with a type and count of items
    // with this type in the input array, sorted by type.
    // Like an Object.entries() result: [['boolean', 3], ['string', 5]]

    const ret = {};
    for (const key in arr) {
        const type = getRealType(arr[key]);
        ret[type] = ret[type] ? ret[type] + 1 : 1;
    }
    return Object.entries(ret).sort((a, b) => (a[0] < b[0] ? -1 : 1));
};

const sortTypes = (arr) => {
    // Функция сортирует массив, дабы он соответствовал правильному порядку типов
    const ret = {};
    for (const type of arr) {
        ret[type[0]] = type[1];
    }
    return Object.entries(ret).sort((a, b) => (a[0] < b[0] ? -1 : 1));
};

const getRealTypesOfItems = (arr) => {
    // Return array with real types of items of given array
    return arr.map((a) => getRealType(a));
    // Стрелочная функция
};

const everyItemHasAUniqueRealType = (arr) => {
    // Return true if there are no items in array
    // with the same real type
    return countRealTypes(arr).length === arr.length;
};

// Tests

testBlock('getType');

test('Boolean', getType(true), 'boolean');
test('Number', getType(123), 'number');
test('String', getType('whoo'), 'string');
test('Array', getType([]), 'object');
test('Object', getType({}), 'object');
test(
    'Function',
    getType(() => {}),
    'function'
);
test('Undefined', getType(undefined), 'undefined');
test('Null', getType(null), 'object');

testBlock('getRealType');

test('Boolean', getRealType(true), 'boolean');
test('Number', getRealType(123), 'number');
test('NaN', getRealType('a' / 123), 'NaN');
test('Infinity', getRealType(1 / 0), 'Infinity');
test('String', getRealType('whoo'), 'string');
test('Array', getRealType([]), 'array');
test('Object', getRealType({}), 'object');
test(
    'Function',
    getRealType(() => {}),
    'function'
);
test('Undefined', getRealType(undefined), 'undefined');
test('Null', getRealType(null), 'null');
test('Date', getRealType(new Date()), 'date');
test('Regexp', getRealType(/ab+c/), 'regexp');
test('Set', getRealType(new Set([1, 2])), 'set');
test('Map', getRealType(new Map()), 'map');

// console.log(getTypesOfItems([1, 2, 'Привет', {}, !1, [], /ab+c/, new Date()]));
// Список обычных типов

testBlock('allItemsHaveTheSameType');

test('All values are numbers', allItemsHaveTheSameType([11, 12, 13]), true);

test('All values are strings', allItemsHaveTheSameType(['11', '12', '13']), true);

test(
    'All values are strings but wait',
    allItemsHaveTheSameType(['11', new String('12'), '13']),
    // What the result?
    false
    // Команда new String - объектоподобное что-то создаёт, поэтому разные типы
);

test(
    'Values like a number',
    allItemsHaveTheSameType([123, 123 / 'a', 1 / 0]),
    // What the result?
    true
    // тестируем стандартные типы, NaN и Infinity это числа по мнению JS
);

test('Values like an object', allItemsHaveTheSameType([{}]), true);

testBlock('getTypesOfItems VS getRealTypesOfItems');

const knownTypes = [
    // Add values of different types like boolean, object, date, NaN and so on
    true,
    1,
    'asdf',
    null,
    [],
    {},
    () => {},
    undefined,
    'a' / 2,
    1 / 0,
    new Date(),
    /ab+c/,
    new Set([1, 1, 2]),
    new Map(),
    BigInt(1),
    Symbol('abc'),
];

test('Check basic types', getTypesOfItems(knownTypes), [
    // What the types?
    'boolean',
    'number',
    'string',
    'object',
    'object',
    'object',
    'function',
    'undefined',
    'number',
    'number',
    'object',
    'object',
    'object',
    'object',
    'bigint',
    'symbol',
]);

test('Check real types', getRealTypesOfItems(knownTypes), [
    'boolean',
    'number',
    'string',
    'null',
    'array',
    'object',
    'function',
    'undefined',
    'NaN',
    'Infinity',
    'date',
    'regexp',
    'set',
    'map',
    'bigint',
    'symbol',
]);

testBlock('everyItemHasAUniqueRealType');

test('All value types in the array are unique', everyItemHasAUniqueRealType([true, 123, '123']), true);

test('All value types in the array are unique', everyItemHasAUniqueRealType([new Date(), new Set(), new Map()]), true);

test('Two values have the same type', everyItemHasAUniqueRealType([true, 123, '123' === 123]), false);

test('There are no repeated types in knownTypes', everyItemHasAUniqueRealType(knownTypes), true);

testBlock('countRealTypes');

test('Count unique types of array items', countRealTypes([true, null, !null, !!null, {}]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

test('Counted unique types are sorted', countRealTypes([{}, null, true, !null, !!null]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

// Add several positive and negative tests
test(
    'Counted unique types are NOT sorted',
    countRealTypes([{}, null, true, !null, !!null]),
    [
        // Такая фигня случается если порядок не соответствует
        ['boolean', 3],
        ['object', 1],
        ['null', 1],
    ],
    true
    // Ставим инверсный порядок (негативный пример)
);

test(
    'Counted unique types предварительно отсортированные',
    countRealTypes([{}, null, true, !null, !!null]),
    sortTypes([
        // А вот здесь типы предварительно сортируем
        ['boolean', 3],
        ['object', 1],
        ['null', 1],
    ])
);

test(
    'Counted unique types предварительно отсортированные',
    countRealTypes([{}, new Date(null), true, !null, !!null, new Map()]),
    sortTypes([
        // А вот здесь типы предварительно сортируем
        ['boolean', 3],
        ['object', 1],
        // ['null', 1], - нету null
        ['date', 1],
        ['map', 1],
    ])
);

test('Рекурсивно', countRealTypes([countRealTypes([{}, new Date(null), true, !null, !!null, new Map()])]), [
    ['array', 1],
]);

test('Константа как функция', countRealTypes([countRealTypes]), [['function', 1]]);

test(
    'Невозможная ситуация',
    countRealTypes([{}, null, true, !null, !!null]),
    [
        // повторяющиеся типы данных
        ['boolean', 3],
        ['boolean', 1],
    ],
    true
    // Ставим инверсный порядок (негативный пример)
);

test('Равенство разных массивов', areEqual([1, 2, 3], [1, 2, 3, 4]), false);
