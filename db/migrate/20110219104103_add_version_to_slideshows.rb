class AddVersionToSlideshows < ActiveRecord::Migration
  def self.up
    add_column :slideshows, :version, :integer, :default => 0
  end

  def self.down
    remove_column :slideshows, :version
  end
end
