ActiveAdmin.register Store do
  permit_params :name, :address, :contact, :menu_url, :website, :instagram

  index do
    selectable_column
    id_column
    column :name
    column :website
    column :contact

    actions
  end

  filter :name
  filter :created_at

  form do |f|
    f.inputs do
      f.input :name
      f.input :website
      f.input :contact
      f.input :menu_url
      f.input :instagram
      f.input :address
    end
    f.actions
  end

end
