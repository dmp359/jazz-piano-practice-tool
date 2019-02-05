// Dan Perlman, dmp359@drexel.edu
// CS530: DUI, Assignment 1

var bikes = [
    {
        "id": "b1",
        "name": "Sixthreezero Around The Block Women's Single Speed Cruiser Bicycle Coral w/ Black Seat/Grips",
        "wheels": 2,
        "size": 26,
        "motor": "No",
        "folding": "No",
        "image": "sixthreezero.jpg",
        "available": 2
    },
    {
        "id": "b2",
        "name": "Roadmaster 26 Men's Granite Peak Men's Bike",
        "wheels": 2,
        "size": 26,
        "motor": "No",
        "folding": "No",
        "image": "roadmaster.jpg",
        "available": 0
    },
    {
        "id": "b3",
        "name": "Fun 20 Inch Wheel Unicycle with Alloy Rim",
        "wheels": 1,
        "size": 20,
        "motor": "No",
        "folding": "No",
        "image": "unicycle.jpg",
        "available": 7
    },
    {
        "id": "b4",
        "name": "Mongoose Dolomite Fat Tire Mountain Bike",
        "wheels": 2,
        "size": 26,
        "motor": "No",
        "folding": "No",
        "image": "mongoose.jpg",
        "available": 3
    },
    {
        "id": "b5",
        "name": "EuroMini ZiZZO Campo 28lb Lightweight Aluminum Frame Shimano 7 - Speed Folding Bike",
        "wheels": 2,
        "size": 20,
        "motor": "No",
        "folding": "Yes",
        "image": "euromini.jpg",
        "available": 1
    },
    {
        "id": "b6",
        "name": "Huffy Mountain Bike Summit Ridge w / Shimano & Trail Tires",
        "wheels": 2,
        "size": 24,
        "motor": "No",
        "folding": "No",
        "image": "huffy.jpg",
        "available": 0
    },
    {
        "id": "b7",
        "name": "Razor RSF350 Electric Street Bike",
        "wheels": 2,
        "size": 10,
        "motor": "Yes",
        "folding": "No",
        "image": "razor.jpg",
        "available": 8
    },
    {
        "id": "b8",
        "name": "Shaofu Folding Electric Bicycle – 350W 36V Waterproof E-Bike with 15 Mile Range Collapsible Frame and APP Speed Setting",
        "wheels": 2,
        "size": 12,
        "motor": "Yes",
        "folding": "Yes",
        "image": "shaofu.jpg",
        "available": 0
    },
    {
        "id": "b9",
        "name": "Goplus Adult Tricycle Trike Cruise Bike Three-Wheeled Bicycle w/Large Size Basket for Recreation Shopping Exercise",
        "wheels": 3,
        "size": 26,
        "motor": "No",
        "folding": "No",
        "image": "tricycle.jpg",
        "available": 2
    },
    {
        "id": "b10",
        "name": "Swagtron 200W SWAGCYCLE Envy Steel Frame Folding Electric Bicycle e Bike w / Automatic Headlight",
        "wheels": 2,
        "size": 12,
        "motor": "Yes",
        "folding": "Yes",
        "image": "swagtron.jpg",
        "available": 5
    }
];

// Create table data from bikes array
// If there are bikes available, append a button to rent
// Toggle unavailable class to the row if bike is not available
// Decrement availability if clicked and handle 0 availability again
let $rentButton = null;
bikes.forEach(bike => {
    if (bike.available > 0) {
        $rentButton = $('<button>').addClass('btn').text('Rent').attr('id', `button-${bike.id}`);
        $rentButton.click(() => {
            $(`#${bike.id}`).text(--bike.available)
            if (bike.available <= 0) {
                $(`#button-${bike.id}`).remove();
                $(`#row-${bike.id}`).addClass('unavailable');
            }
        });
    }
    else {
        $rentButton = null;
    }

    $('#bike-table')
        .append( $('<tr>').attr('id', `row-${bike.id}`)
            .append( $('<td>')
                .append( $('<img>').attr('src', `/img/bikes/${bike.image}`)))
            .append( $('<td>').text(bike.name))
            .append( $('<td>').text(bike.available).attr('id', bike.id))
            .append( $('<td>')
                .append($rentButton))
            .toggleClass('unavailable', bike.available <= 0)
        )
});
