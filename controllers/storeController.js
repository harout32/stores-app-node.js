const {Store} = require('../models/Store');
const {User}  = require('../models/User');
const {pick}  = require('lodash');
const jimp    = require('jimp');
const uuid    = require('uuid');

const multer  = require('multer');
const multerOption = {
    storage:         multer.memoryStorage(),
    fileFilters(req, file, next){
        const isPhoto = file.mimetype.startWith('image/');
        if(isPhoto) next(null, true)
        else {
            next({message:'that file is not supported !!'}, false);
        }
    }
}

exports.upload = multer(multerOption).single('photo');

exports.resize = async (req, res, next) => {
if( !req.file ){
    next(); //skip to the next middle ware
    return;
}
const extention = req.file.mimetype.split('/')[1];
req.body.photo = `${uuid.v4()}.${extention}`;
//now resizing
const photo = await jimp.read(req.file.buffer);
await photo.resize(800, jimp.AUTO);
await photo.write(`./public/uploads/${req.body.photo}`);
//carry on whene the photo is saved to the filesystem
console.log('yeah');
next();
};

exports.homePage = (req, res)=> {
// req.flash('error','error');
// req.flash('info','Info');
// req.flash('warning','warning')
// req.flash('success','success');
res.render('index');
};

exports.addStore = (req, res) => {
res.render('editStore',{title:'hii'});
};

exports.createStore = async (req, res) => {
    req.body.author = req.user._id;
    // const store = new Store(req.body)
    const store = await ( new Store(req.body) ).save();
    req.flash('success',`Succesfully Created ${store.name}. care to leave a review`);
    res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res)=>{
    const stores = await Store.find();
    res.render('stores',{title:'Stores', stores});
};

exports.getStoreBySlug = async (req, res, next) => {
    // populate returns back the reference of the ObjectId as a whole Object
    // second para is to specify what data to be encluded in the populate just like .select()
    const store  = await Store.findOne({slug: req.params.slug})
    // .populate('author', ['_id','name','email']);
    .populate('author reviews');
    if(!store) return next();
    res.render('store',{title:store.name,store});
};

exports.getStoreByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || {$exists: true}; // return all the stores that have a tags properety
    const tagsPromise =  Store.getTagsList();
    const storesPromise = Store.find({tags: tagQuery});
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
    res.render('tag', {title:'Tags',tags,stores, tag});
};

const confirmOwner = (store, user) => {
    if(! store.author.equals(user._id)){
        throw Error('You must own the Store to edit ir');
    }
};

exports.editStore = async (req, res) => {
    //1 find the store given ID
    const store = await Store.findOne({_id: req.params.id});
    //confirm they own the store 
    confirmOwner(store, req,user);
    //render out the edit form
    res.render('editStore', {title:`edit ${store.name}`,store});
};

exports.updateStore = async (req, res) => {
    req.body.location.type = 'Point';
    const store = await Store.findOneAndUpdate({_id:req.params.id},pick(req.body,['name','description','tags','location']),{
        new:true,
        runValidators: true
    }).exec();
    req.flash('success',`Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store </a>`);
    res.redirect(`/stores/${store._id}/edit`)
};

exports.searchStores = async(req, res) => {
    const stores = await Store
    .find({
        //using the index to find the store with text
        $text: { $search: req.query.q}
    }, {
        //using textscore as a metadata of mongoDB => most apeared of the searched word = order
        //represented as score properety for each result
        score: {$meta: 'textScore'}
    })
    .sort({score: {$meta: 'textScore'}})// resort the data 
    .limit(5) // limit the data to 5
    res.json(stores);
}
exports.mapStores = async (req, res) => {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
    const q = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: 10000 // 10km
        }
      }
    };
  //.select(specify the wanted or not wanted properety in the result) -sulg (unwanted) || slug (wanted)
    const stores = await Store.find(q).select('slug name description location').limit(10);
    res.json(stores);
  };
  exports.mapPage = (req, res) => {
      res.render('map', {title: 'Map'});
  };

  exports.heartStore = async (req, res) => {
      const hearts = req.user.hearts.map(obj => obj.toString());
      //$push does not care if the pushed is unique but $addToSet cares about it
      const operator = hearts.includes(req.params.id) ? '$pull': '$addToSet';
      const user = await User.findOneAndUpdate(
          req.user._id,
        { [operator]:{ hearts: req.params.id } },
        { new: true }
        );
      console.log(hearts);
      res.json(user);
  }
  exports.getHearts = async (req, res) => {
      //$in look for an ID that is inside the array req.user.hearts
      const stores = await Store.find({
          _id: { $in: req.user.hearts }
      });
      res.render('stores', { title: 'Hearted Stores', stores });
  }