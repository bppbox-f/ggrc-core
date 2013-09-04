/*
 * Copyright (C) 2013 Google Inc., authors, and contributors <see AUTHORS file>
 * Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 * Created By:
 * Maintained By:
 */

//= require can.jquery-all
//= require models/display_prefs

(function(can, $) {
  var default_widget_sort = [
     "info_widget"
   , "program_widget"
   , "regulation_widget"
   , "contract_widget"
   , "policy_widget"
   , "objective_widget"
   , "control_widget"
   , "system_widget"
   , "process_widget"
   , "data_asset_widget"
   , "product_widget"
   , "project_widget"
   , "facility_widget"
   , "market_widget"
   , "org_group_widget"
   , "person_widget"
   , "document_widget"
   ];

can.Control("CMS.Controllers.SortableWidgets", {
  defaults : {
      page_token : null
    , sort : default_widget_sort
  }

  , init : function(el, opts) {
    this._super && this._super.apply(this, arguments);
    var that = this;
    CMS.Models.DisplayPrefs.findAll().done(function(data) {
      var m = data[0] || new CMS.Models.DisplayPrefs();
      m.save();
      that.defaults.model = m;
    });
  }
}, {

  init : function() {
    this.options.page_token = window.getPageToken();
    var page_sorts = this.options.model.getSorts(this.options.page_token);
    var that = this;

    var this_sort = page_sorts.attr($(this.element).attr("id"));
    if(this_sort && this_sort instanceof can.Observe.List) {
      this.options.sort = this_sort;
    } else {
      this.options.sort = new can.Observe.List(can.map(this.options.sort, function(id) {
        return that.element.find("#" + id).length ? id : undefined;
      }));
      //put everything NOT in the default sort at the bottom.
      this.options.sort.push.apply(
        this.options.sort
        , this.element.find("section[id]").map(function(i, sec) {
            return ~can.inArray(sec.id, that.options.sort) ? undefined : sec.id;
          })
        );
      page_sorts.attr($(this.element).attr("id"), this.options.sort);
      this_sort = this.options.sort;
    }

    var that = this;
    var firstchild = null;
    can.each(this_sort, function(id) {
      firstchild || (firstchild = $("#" + id));
      var $widget = $("#" + id).detach();
      if(!$widget.length) {
        that.options.dashboard_controller.add_dashboard_widget_from_name(
          id.substr(0, id.indexOf("_widget")));
        $widget = $("#" + id);
      }
      $widget.css("display", "none").appendTo(that.element);
      //add this widget to the inner nav list
    });
    this.apply_widget_sort(this_sort);
    this.element.find('section').css("display", "block").trigger('min_size');
    //if(firstchild) {
    //  firstchild.prevAll().detach().appendTo(this.element); //do the shuffle
    //}

    this.sortable().sortable("refresh");
    // FIXME: Is `this.is_initialized` necessary anymore?
    this.is_initialized = true;
    //this.force_add_widget_bottom();
  }

  , sortable: function() {
      return this.element.sortable({
          connectWith: '.widget-area'
        , placeholder: 'drop-placeholder'
        , handle : "header, .header"
        , items : ".widget"
      });
    }

  , " sortremove" : "update_event"
  , " sortupdate" : "update_event"
  , " sortreceive": "update_event"
/*
  , " sortupdate" : "force_add_widget_bottom"
  , " sortreceive" : "force_add_widget_bottom"
  , force_add_widget_bottom : function(el, ev, data) {
      // This doesn't seem necessary...
      if(this.is_initialized) {
        var $add_box = this.element.find(".cms_controllers_add_widget")
          , $parent = $add_box.parent();
        if($add_box.is(":not(:last-child)")) {
          $add_box.detach().appendTo($parent);
        }
      }
      this.update_event(el, ev, data);
    }*/

  , update_event : function(el, ev, data) {
      if(this.is_initialized) {
        this.sortable().sortable("refresh");
        this.options.sort.replace(this.element.sortable("toArray"));
        this.options.model.save()
        this.element.trigger("widgets_updated");
      }
    }

  , " apply_widget_sort": function(el, ev, widget_ids) {
      this.apply_widget_sort(widget_ids);
    }

  , apply_widget_sort: function(widget_ids) {
      var $container = this.element
        , $prev = null
        ;

      can.each(widget_ids, function(id) {
        var $elem = $container.find(id)
          ;

        if ($elem) {
          if ($prev)
            $prev.after($elem);
          else
            $container.prepend($elem);
          $prev = $elem;
        }
      });

      this.update_event();
    }
});

})(this.can, this.can.$);
