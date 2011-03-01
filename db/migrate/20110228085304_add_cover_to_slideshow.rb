class AddCoverToSlideshow < ActiveRecord::Migration
  def self.up
    add_column :slideshows, :cover, :text
  end

  def self.down
    remove_column :slideshows, :cover
  end
end
