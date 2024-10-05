ActiveAdmin.register Promotion do
  permit_params :title, :desctription, :store_id, :recurring, :recurrence_frequency

  index do
    selectable_column
    id_column
    column :store_name
    column :title
    column :promotion_kind
    column :starts_at
    column :ends_at
    column :recurrence_frequency

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
      f.input :recurrence_frequency
      f.input :recurring
    end
    f.actions
  end

end
