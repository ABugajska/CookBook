jQuery(function() {
// CookBook array //
var recipeStorage = new Backbone.LocalStorage("cookBook");
// localStorage: Recipestorage
_.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

// MODEL //

var SingleRecipe = Backbone.Model.extend({
    localStorage: recipeStorage,
    validation: {
        title: {
            required: true,
            minLength: 3,
            msg: 'enter a name of a dish'
            
        },
        difficulty: {
            required: true,
            oneOf: ['easy', 'normal', 'hard'],
            msg: 'The dish is easy/normal/hard to make?'
        },
        ingredients: {
            required: true,
            minLength: 3
        }

    }


});




// COLLECTION //

var CookBook = Backbone.Collection.extend({
    localStorage: recipeStorage,
    model: SingleRecipe
});

window.recipeList = new CookBook();

// So this is hint from Maciek
/* 
    Idea for communication between compontents of the app: a common event bus.
    PubSub pattern.
*/
var vent = _.extend({}, Backbone.Events); // this copies Backbone.Events object into vent



// VIEWS //


// RECIPES LIST VIEW //
var CookBookView = Backbone.View.extend({

    tagName: 'ol',

    initialize: function () {
        this.collection.bind("add", function(recipe){
            $(this.el).append(new CookBookRecipeView({model: recipe}).render().el);
        }, this);

        // #1. Destroying a model triggers 'destroy' model on all collections containing this model
        this.collection.bind("destroy", this.onAfterRemove, this);
        vent.on('recipe:update', this.render, this);
    },

    render: function (eventName) {
        var self = this;
        this.$el.empty();
        this.collection.each(function (model) {
            $(self.el).append(new CookBookRecipeView({model: model}).render().el);
        });
        return this;
    },

    onAfterRemove: function () {
        var url;

        // #2 check if there are models in the collection
        if (this.collection.length > 0) {
            // #3. Get a url of the first link on the list (we don't need hash so remove it) 
            url = this.$('a').first().attr('href').replace('#', ''); // backbone url
        } else {
            // #4. if collection is empty, go to 'index' page
            url = '';
        }

        // #5. navigate to set url and execute it's handler
        app.navigate(url, { trigger: true });
    }

});

// SINGLE RECIPE VIEW //

var CookBookRecipeView = Backbone.View.extend({

    tagName: 'li',
    template: _.template($('#cook-book-tpl').html()),
    initialize: function() {
        this.render();
        this.model.bind('destroy', function() {
            this.$el.remove();
        }, this);
    },

    render: function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        if (this.model.get('favourite')){
            this.$el.addClass('favourite');
        }
        return this;
    }


});

// SINGLE RECIPE DESCRIPTION VIEW //

var SingleRecipeView = Backbone.View.extend({
    template: _.template($('#single-recipe-description-tpl').html()),

     events: {
        "click #remove" : 'onRemove',
        "click #fav": 'addFav'
    },

    render: function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    onRemove: function(event) {
        event.preventDefault();
        var self;

        self = this;
        $.when(this.model.destroy()).then(function() {
            // what

            // PubSub - publishing an event
            // after destroying a model this view publishes recipe:remove event
            vent.trigger("recipe:remove", self.model); 
        });
    },

    addFav: function(event) {
        event.preventDefault();

        var itemId = $(event.currentTarget).attr('data-item');
        this.model.set('favourite', !this.model.get('favourite'));
        $.when(this.model.save()).then(function () {
            vent.trigger("recipe:update", this.model);
        }.bind(this));
        

        
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
    // onEdit: function(event){
    //     event.preventDefault();
    //     this.model.set({
    //         title: this.$("input[name='title']").val(),
    //         difficulty: this.$("input[name='difficulty']").val(),
    //         ingredients: this.$("input[name='ingredients']").val()
    //     }).save();
    // }


    onEdit: function(event){
        event.preventDefault();
        this.model.set({
            title: this.$("input[name='title']").val(),
            difficulty: this.$("input[name='difficulty']").val(),
            ingredients: this.$("input[name='ingredients']").val()
        });
        var that = this;
        $.when(that.model.save()).then(function () {
              vent.trigger("recipe:update", that.model);
        });
   
   }     
});

//  ADD ITEM VIEW  //

var AddRecipeView = Backbone.View.extend({

    events: {
        'click [data-action=add]':"onAdd"
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
        this.model.set({
            title: this.$("input[name='title']").val(),
            difficulty: this.$("input[name='difficulty']").val(),
            ingredients: this.$("input[name='ingredients']").val()
        });
        var that = this;
        console.log(this.model.validate());
        if (this.model.isValid()) {
            $.when(this.model.save()).then(function(){
                that.collection.add(that.model);
            });
        }
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

    index: function(){
        var promise = recipeList.fetch({ reset: true });

        return promise.then(function () {
            var cookBookView = new CookBookView({collection: recipeList});
            $('#list-content').html(cookBookView.render().el);
            $('#recipe-description').empty();
        });
         
    },


    singleRecipeDescription: function(id){
        this.index().then(function () {
            var recipe = recipeList.get(id);
        
            if (!recipe) {
                recipe = new SingleRecipe({id: id});
            }
            $.when(recipe.fetch()).then(function(){
                var singleRecipeView = new SingleRecipeView({model: recipe});
                $('#recipe-description').html(singleRecipeView.render().el);
            });
        });
        

    },

    addRecipe: function(){
        var newRecipe = new AddRecipeView({
            model: new SingleRecipe,
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


});
