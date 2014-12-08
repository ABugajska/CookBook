jQuery(function() {
// CookBook array //

var RecipeList = [
    {title: "tomato soup",
        difficulty: "simple",
        ingredients: [
            "tomatos",
            "onion",
            "carrot"],
        id: 1


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


// RECIPES LIST VIEW //
var CookBookView = Backbone.View.extend({

    tagName: 'ul',

    initialize: function () {
        this.model.bind("reset", this.render, this);
    },

    render: function (eventName) {
        _.each(this.model.models, function (recipe) {
            $(this.el).append(new CookBookRecipeView({model: recipe}).render().el);
        }, this);
        return this;
    }

});

// SINGLE RECIPE VIEW //

var CookBookRecipeView = Backbone.View.extend({

    tagName: 'li',

    template: _.template($('#cook-book-tpl').html()),

    render: function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }


});

// SINGLE RECIPE DESCRIPTION VIEW //

var SingleRecipeView = Backbone.View.extend({

    template: _.template($('#single-recipe-description-tpl').html()),

    render: function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});



// ROUTES //


var AppRouter = Backbone.Router.extend({

    routes: {
        "": "index",
        "recipes/:id": "singleRecipeDescription"

    },

    index: function() {
        this.recipeList = new cookBook();
        this.cookBookView = new CookBookView({model: recipeList});
        $('#list-content').html(this.cookBookView.render().el);


    },

    singleRecipeDescription: function(id){
        this.recipe = recipeList.get(id);
        this.singleRecipeView = new SingleRecipeView({model: this.recipe});
        $('#recipe-description').html(this.singleRecipeView.render().el);

    }


});
var app = new AppRouter();

    Backbone.history.start();
});
