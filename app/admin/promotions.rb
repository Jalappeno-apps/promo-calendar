ActiveAdmin.register Promotion do
  permit_params :name, :address, :contact, :menu_url, :website, :instagram

  index do
    selectable_column
    id_column
    column :name
    column :title 
    column :promotion_kind
    column :starts_at
    column :ends_at
    column :recurring

    actions
  end

  filter :title
  filter :created_at

  form do |f|
    f.inputs do
      f.input :title
      f.input :description
      f.input :starts_at
      f.input :ends_at
    end
    f.actions
  end

end
