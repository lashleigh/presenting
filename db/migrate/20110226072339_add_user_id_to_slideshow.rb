class AddUserIdToSlideshow < ActiveRecord::Migration
  def self.up
    add_column :slideshows, :user_id, :integer
  end

  def self.down
    remove_column :slideshows, :user_id
  end
end
