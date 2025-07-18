
// packages
#import "@preview/lilaq:0.2.0" as lq

// set doc metadata
#set document(author: "NeuroGen", title: "NeuroGen Report")

// font style
#set text(font: "New Computer Modern", size: 10pt, lang: "en", ligatures: false)

// page properties
#set page(margin: 0.5in, paper: "a4")


// Small caps for section titles
#show heading.where(level: 2): it => [
  #pad(top: 0pt, bottom: -10pt, [#smallcaps(it.body)])
  #line(length: 100%, stroke: 0.1pt)
]

// Name will be aligned left, bold and big
#show heading.where(level: 1): it => [
  #set align(center)
  #set text(weight: 500, size: 24pt)
  #pad([#smallcaps(it.body)])
]

// = Swarnim Barapatre

// // personal info
// #pad(top: 0.25em, align(center)[
//   +91 8149 833 469 |
//   Pune |
//   #link("mailto:swarnim335@gmail.com") |
//   #link("https://github.com/swarnimcodes/")[github/swarnimcodes] |
//   #link(
//     "https://www.linkedin.com/in/swarnimbarapatre/",
//   )[linkedin/swarnimbarapatre]
// ])


// #lq.diagram(
//   lq.plot(
//   (0, 1, 2, 3, 4),
//   (5, 4, 2, 1, 2)
// ))


// #lq.diagram(
//   xaxis: (
//     ticks: ("Apples", "Bananas", "Kiwis", "Mangos", "Papayas")
//       .map(rotate.with(-45deg, reflow: true))
//       .map(align.with(right))
//       .enumerate(),
//     subticks: none,
//   ),
//   lq.bar(
//     range(5),
//     (5, 3, 4, 2, 1),
//   )
// )
//   #lq.diagram(
//   xaxis: (
//     ticks: ("Oil ", "Speed", "Voltage", "Current")
    
//     .enumerate(),
//   subticks: none,
// ),
// lq.bar(range(4),
// (5,4,2,1)
// )
// )


    #let xs = ("11-06", "10-06")
    #let ys = (200, 200)
    
    #lq.diagram(
      xaxis: (
        ticks: xs .map(rotate.with(-45deg, reflow: true))
      .map(align.with(right)).enumerate(),
      ),
  
      lq.bar(range(2), ys, label: ["Generator Phase 1 Voltage"])
    )
  