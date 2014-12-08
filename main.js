// CookBook array //

var RecipeList = [
    {title: "tomato soup",
        difficulty: "simple",
        ingredients: [
            "tomatos",
            "onion",
            "carrot"],


    },
    {title: "pea soup",
        difficulty: "simple",
        ingredients: [
            "peas",
            "onion",
            "potatos"],
        id: 2

    },
    {title: "dumplings",
        difficulty: "tough",
        ingredients:[
            "pastry",
            "pot cheese",
            "eggs"],
        id: 3
    }


];


// MODEL //

var singleRecipe = Backbone.Model.extend();


// COLLECTION //

var cookBook = Backbone.Collection.extend({
   model: singleRecipe

});

var recipeList = new cookBook(RecipeList);



// VIEWS //

var CookBookView = Backbone.View.extend({

    el: '.main',

    initialize: function (){
        this.render();

    },

    render: function(){

        var CookBookViewTpl = _.template($('#recipes-list').html(), {recipeList: recipeList.models});
        $('.main').html(CookBookViewTpl);

    }





});



// ROUTES //


var AppRouter = Backbone.Router.extend({

    routes: {
        "": "index"

    },

    index: function() {


    }


});

var app = new AppRouter();
Backbone.history.start();