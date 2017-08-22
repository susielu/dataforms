const transforms = require("./transforms")

const values = ["2017-02-01", "2017-02-03", "2017-02-04", "2017-02-07"]

describe("toMapByDimension", () => {
  test("turns into dimension", () => {
    const values = [
      {
        signup_cnt: 901,
        subregion: "Africa",
        timestamp: "2017-04-24T00:00:00.000Z"
      },
      {
        signup_cnt: 8790,
        subregion: "Australia/NZ",
        timestamp: "2017-04-24T00:00:00.000Z"
      },
      {
        signup_cnt: 901,
        subregion: "Africa",
        timestamp: "2017-04-25T00:00:00.000Z"
      },
      {
        signup_cnt: 8790,
        subregion: "Australia/NZ",
        timestamp: "2017-04-25T00:00:00.000Z"
      }
    ]

    const transformed = {
      Africa: [
        {
          signup_cnt: 901,
          subregion: "Africa",
          timestamp: "2017-04-24T00:00:00.000Z"
        },
        {
          signup_cnt: 901,
          subregion: "Africa",
          timestamp: "2017-04-25T00:00:00.000Z"
        }
      ],
      "Australia/NZ": [
        {
          signup_cnt: 8790,
          subregion: "Australia/NZ",
          timestamp: "2017-04-24T00:00:00.000Z"
        },
        {
          signup_cnt: 8790,
          subregion: "Australia/NZ",
          timestamp: "2017-04-25T00:00:00.000Z"
        }
      ]
    }

    expect(transforms.toMapByDimension({ values, dim: "subregion" })).toEqual(
      transformed
    )

    expect(
      transforms.toMapByDimension({ values, dim: d => d.subregion })
    ).toEqual(transformed)
  })
})

describe("toMapByDimensions", () => {
  test("turns into nested dimensions", () => {
    const values = [
      {
        signup_cnt: 901,
        subregion: "Africa",
        name: "one",
        timestamp: "2017-04-24T00:00:00.000Z"
      },
      {
        signup_cnt: 8790,
        subregion: "Australia/NZ",
        name: "one",
        timestamp: "2017-04-24T00:00:00.000Z"
      },
      {
        signup_cnt: 901,
        subregion: "Africa",
        name: "two",
        timestamp: "2017-04-25T00:00:00.000Z"
      },
      {
        signup_cnt: 8790,
        subregion: "Australia/NZ",
        name: "two",
        timestamp: "2017-04-25T00:00:00.000Z"
      }
    ]

    const transformed = {
      Africa: {
        one: [
          {
            name: "one",
            signup_cnt: 901,
            subregion: "Africa",
            timestamp: "2017-04-24T00:00:00.000Z"
          }
        ],
        two: [
          {
            name: "two",
            signup_cnt: 901,
            subregion: "Africa",
            timestamp: "2017-04-25T00:00:00.000Z"
          }
        ]
      },
      "Australia/NZ": {
        one: [
          {
            name: "one",
            signup_cnt: 8790,
            subregion: "Australia/NZ",
            timestamp: "2017-04-24T00:00:00.000Z"
          }
        ],
        two: [
          {
            name: "two",
            signup_cnt: 8790,
            subregion: "Australia/NZ",
            timestamp: "2017-04-25T00:00:00.000Z"
          }
        ]
      }
    }

    expect(
      transforms.toMapByDimensions({
        values,
        dim: "subregion",
        secondDim: "name"
      })
    ).toEqual(transformed)
  })
})

describe("timestampsFromData", () => {
  test("array values", () => {
    expect(transforms.timestampsFromData({ values })).toEqual(values)
  })

  test("duplicate values", () => {
    const duplicateValues = ["2017-02-01", "2017-02-01", "2017-02-01"]

    expect(transforms.timestampsFromData({ values: duplicateValues })).toEqual([
      "2017-02-01"
    ])
  })

  test("object values", () => {
    const objectValues = [
      { date: "2017-02-01" },
      { date: "2017-02-03" },
      { date: "2017-02-04" },
      { date: "2017-02-07" }
    ]

    expect(
      transforms.timestampsFromData({ values: objectValues, dim: "date" })
    ).toEqual(values)
  })

  test("function values", () => {
    const objectValues = [
      { date: "2017-02-01" },
      { date: "2017-02-03" },
      { date: "2017-02-04" },
      { date: "2017-02-07" }
    ]

    expect(
      transforms.timestampsFromData({ values: objectValues, dim: d => d.date })
    ).toEqual(values)
  })
})

describe("zeroFillLine", () => {
  const values = [
    { timestamp: "2017-02-01", metric: 5 },
    { timestamp: "2017-02-03", metric: 4 },
    { timestamp: "2017-02-04", metric: 3 },
    { timestamp: "2017-02-07", metric: 1 }
  ]

  const timestamps = [
    "2017-01-31",
    "2017-02-01",
    "2017-02-03",
    "2017-02-04",
    "2017-02-05",
    "2017-02-06",
    "2017-02-07",
    "2017-02-08"
  ]

  const zeroFilled = [
    { metric: 0, timestamp: "2017-01-31" },
    { metric: 5, timestamp: "2017-02-01" },
    { metric: 4, timestamp: "2017-02-03" },
    { metric: 3, timestamp: "2017-02-04" },
    { metric: 0, timestamp: "2017-02-05" },
    { metric: 0, timestamp: "2017-02-06" },
    { metric: 1, timestamp: "2017-02-07" },
    { metric: 0, timestamp: "2017-02-08" }
  ]

  test("basic", () => {
    const metrics = ["metric"]

    expect(transforms.zeroFillLine({ values, timestamps, metrics })).toEqual(
      zeroFilled
    )
  })

  test("different time dimension", () => {
    const values = [
      { date: "2017-02-01", metric: 5 },
      { date: "2017-02-03", metric: 4 },
      { date: "2017-02-04", metric: 3 },
      { date: "2017-02-07", metric: 1 }
    ]

    const metrics = ["metric"]

    const zeroFilled = [
      { metric: 0, date: "2017-01-31" },
      { metric: 5, date: "2017-02-01" },
      { metric: 4, date: "2017-02-03" },
      { metric: 3, date: "2017-02-04" },
      { metric: 0, date: "2017-02-05" },
      { metric: 0, date: "2017-02-06" },
      { metric: 1, date: "2017-02-07" },
      { metric: 0, date: "2017-02-08" }
    ]

    expect(
      transforms.zeroFillLine({ values, timestamps, metrics, timeDim: "date" })
    ).toEqual(zeroFilled)
  })

  test("additional metrics", () => {
    const metrics = ["metric", "count"]
    const values = [
      { timestamp: "2017-02-01", metric: 5, cell: 10 },
      { timestamp: "2017-02-03", metric: 4, cell: 10 },
      { timestamp: "2017-02-04", metric: 3, cell: 10 },
      { timestamp: "2017-02-07", metric: 1, cell: 10 }
    ]

    const zeroFilled = [
      { metric: 0, timestamp: "2017-01-31", cell: 10 },
      { metric: 5, timestamp: "2017-02-01", cell: 10 },
      { metric: 4, timestamp: "2017-02-03", cell: 10 },
      { metric: 3, timestamp: "2017-02-04", cell: 10 },
      { metric: 0, timestamp: "2017-02-05", cell: 10 },
      { metric: 0, timestamp: "2017-02-06", cell: 10 },
      { metric: 1, timestamp: "2017-02-07", cell: 10 },
      { metric: 0, timestamp: "2017-02-08", cell: 10 }
    ]

    expect(transforms.zeroFillLine({ values, timestamps, metrics })).toEqual(
      zeroFilled
    )
  })

  //test("prepost", () => {})
})
