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

    tagName: 'ol',

    initialize: function () {
        this.model.bind("reset", this.render, this);
        this.model.bind("add", function(recipe){
            $(self.el).append(new CookBookRecipeView({model: recipe}).render().el);
        })

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

    initialize: function() {
        this.render();

    },

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

// EDIT ITEM VIEW //

var EditRecipeView = Backbone.View.extend({

    events: {
      'click [data-action=edit]': 'onEdit'

    },

    el: '#recipe-description',

    template: _.template($('#edit-recipe').html()),

    initialize: function() {
        this.render();
    },

    render: function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    onEdit: function(event){
        event.preventDefault();
        this.model.set({
            difficulty: this.$("input[name='difficulty']").val(),
            ingredients: this.$("input[name='ingredients']").val()

        })


    }


});

//  ADD ITEM VIEW  //

var AddRecipeView = Backbone.View.extend({

    events: {
        'click[data-action=add]':"onAdd"
    },

    el: '#recipe-description',

    template: _.template($('#add-recipe').html()),

    initialize: function() {
        this.render();
    },

    render: function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    onAdd: function(event){
        event.preventDefault();
        this.collection.add({
            title: this.$("li").val(),
            difficulty: this.$("input[name='difficulty']").val(),
            ingredients: this.$("input[name='ingredients']").val()
        })

    }
});





// ROUTES //


var AppRouter = Backbone.Router.extend({

    routes: {
        "": "index",
        "recipes/:id": "singleRecipeDescription",
        "edit/:id": "editRecipe",
        'add': 'addRecipe'
    },

    index: function() {



    },

    singleRecipeDescription: function(id){
        this.recipe = recipeList.get(id);
        this.singleRecipeView = new SingleRecipeView({model: this.recipe});
        $('#recipe-description').html(this.singleRecipeView.render().el);

    },

    addRecipe: function(){
        var newRecipe = new AddRecipeView({
            model: new singleRecipe,
            collection: recipeList
        });

    },

    editRecipe: function(id){
        var model = recipeList.get(id);
        var editRecipe = new EditRecipeView({
           model: model
        });

    }


});
var app = new AppRouter();

Backbone.history.start();

var cookBookView = new CookBookView({model: recipeList});
$('#list-content').html(cookBookView.render().el);
});
